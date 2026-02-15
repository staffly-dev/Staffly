import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Env } from "../config/env.config";
import { Request } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export class S3Service {
  private s3_client: S3Client | null = null;
  private bucket_name: string;
  private region: string;

  constructor() {
    this.bucket_name = Env.AWS_S3_BUCKET;
    this.region = Env.AWS_REGION;
    this._initialize_s3_client();
  }

  private _initialize_s3_client(): void {
    try {
      if (Env.AWS_ACCESS_KEY_ID && Env.AWS_SECRET_ACCESS_KEY) {
        this.s3_client = new S3Client({
          region: this.region,
          credentials: {
            accessKeyId: Env.AWS_ACCESS_KEY_ID,
            secretAccessKey: Env.AWS_SECRET_ACCESS_KEY
          }
        });
        console.log("S3 client initialized");
      } else {
        this.s3_client = new S3Client({ region: this.region });
        console.log("S3 client initialized with default credentials");
      }
    } catch (error) {
      console.error("Failed to initialize S3 client:", error);
      this.s3_client = null;
    }
  }

  private _generate_unique_filename(original_filename: string): string {
    const file_extension = path.extname(original_filename).toLowerCase();
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0].replace("T", "_");
    const unique_id = uuidv4().substring(0, 8);
    return `cv_uploads/${timestamp}_${unique_id}${file_extension}`;
  }

  private _validate_file(file: Express.Multer.File): void {
    if (!file || !file.originalname) {
      throw new Error("No file provided");
    }

    const file_extension = path.extname(file.originalname).toLowerCase();
    if (![".pdf", ".docx"].includes(file_extension)) {
      throw new Error("Only PDF and DOCX files are allowed");
    }

    if (file.size > Env.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${Env.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
  }

  async upload_file(file: Express.Multer.File): Promise<any> {
    try {
      this._validate_file(file);

      if (!this.s3_client) {
        throw new Error("S3 service not configured. Please check AWS credentials.");
      }

      // Check bucket access
      try {
        await this.s3_client.send(new HeadBucketCommand({ Bucket: this.bucket_name }));
      } catch (error: any) {
        if (error.name === "NotFound") {
          throw new Error(`S3 bucket '${this.bucket_name}' not found`);
        } else if (error.name === "Forbidden") {
          throw new Error(`Access denied to S3 bucket '${this.bucket_name}'`);
        }
        throw error;
      }

      const s3_key = this._generate_unique_filename(file.originalname);
      const file_content = fs.readFileSync(file.path);

      await this.s3_client.send(new PutObjectCommand({
        Bucket: this.bucket_name,
        Key: s3_key,
        Body: file_content,
        ContentType: file.mimetype,
        Metadata: {
          original_filename: file.originalname,
          uploaded_at: new Date().toISOString(),
          file_size: file.size.toString()
        }
      }));

      // Verify upload
      await this.s3_client.send(new HeadObjectCommand({
        Bucket: this.bucket_name,
        Key: s3_key
      }));

      const backend_base_url = Env.BACKEND_URL;
      const file_url = `${backend_base_url}/ats-checker/s3/file/${s3_key}`;
      const s3_object_url = Env.AWS_S3_BUCKET_URL ? `${Env.AWS_S3_BUCKET_URL}/${s3_key}` : 
        `https://${this.bucket_name}.s3.${this.region}.amazonaws.com/${s3_key}`;

      let presigned_url: string | undefined;
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucket_name,
          Key: s3_key
        });
        presigned_url = await getSignedUrl(this.s3_client, command, { expiresIn: 3600 });
      } catch (error) {
        console.warn("Failed to generate presigned URL:", error);
      }

      return {
        success: true,
        file_url,
        presigned_url,
        s3_object_url,
        s3_key,
        original_filename: file.originalname,
        file_size: file.size,
        content_type: file.mimetype,
        uploaded_at: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("Failed to upload file to S3:", error);
      throw error;
    }
  }

  async delete_file(s3_key: string): Promise<boolean> {
    try {
      if (!this.s3_client) {
        return false;
      }

      await this.s3_client.send(new DeleteObjectCommand({
        Bucket: this.bucket_name,
        Key: s3_key
      }));

      return true;
    } catch (error) {
      console.error("Failed to delete file from S3:", error);
      return false;
    }
  }

  async generate_presigned_url(s3_key: string, expires_in: number = 3600): Promise<string | null> {
    try {
      if (!this.s3_client) {
        return null;
      }

      const command = new GetObjectCommand({
        Bucket: this.bucket_name,
        Key: s3_key
      });

      return await getSignedUrl(this.s3_client, command, { expiresIn: expires_in });
    } catch (error) {
      console.error("Failed to generate presigned URL:", error);
      return null;
    }
  }

  async get_file_bytes(s3_key: string): Promise<{ data: Buffer; content_type: string; content_length: number; original_filename: string } | null> {
    try {
      if (!this.s3_client) {
        return null;
      }

      const command = new GetObjectCommand({
        Bucket: this.bucket_name,
        Key: s3_key
      });

      const response = await this.s3_client.send(command);
      const chunks: Uint8Array[] = [];
      
      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }

      const data = Buffer.concat(chunks);
      const content_type = response.ContentType || "application/octet-stream";
      const content_length = response.ContentLength || data.length;
      const original_filename = response.Metadata?.original_filename || s3_key.split("/").pop() || s3_key;

      return { data, content_type, content_length, original_filename };
    } catch (error: any) {
      if (error.name === "NoSuchKey") {
        console.warn(`S3 object not found: ${s3_key}`);
        return null;
      }
      console.error("Error fetching S3 object:", error);
      return null;
    }
  }

  is_configured(): boolean {
    const has_credentials = !!(Env.AWS_ACCESS_KEY_ID && Env.AWS_SECRET_ACCESS_KEY && this.bucket_name);
    const client_ready = this.s3_client !== null;
    return has_credentials && client_ready;
  }
}

