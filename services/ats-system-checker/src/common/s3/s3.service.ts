import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private client: S3Client | null = null;
  private bucketName: string;
  private region: string;
  private maxFileSize: number;

  constructor(private config: ConfigService) {
    this.bucketName = this.config.get<string>('AWS_S3_BUCKET') || '';
    this.region = this.config.get<string>('AWS_REGION') || 'us-east-1';
    this.maxFileSize = parseInt(this.config.get<string>('MAX_FILE_SIZE') || '10485760', 10); // 10MB
    const key = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secret = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    if (key && secret) {
      this.client = new S3Client({
        region: this.region,
        credentials: { accessKeyId: key, secretAccessKey: secret },
      });
    } else {
      this.client = new S3Client({ region: this.region });
    }
  }

  private generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const ts = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
    const id = uuidv4().substring(0, 8);
    return `cv_uploads/${ts}_${id}${ext}`;
  }

  async uploadBase64(payload: {
    filename: string;
    mimetype?: string;
    data_base64: string;
  }): Promise<any> {
    const buf = Buffer.from(payload.data_base64, 'base64');

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ats-s3-'));
    const tmpPath = path.join(tmpDir, payload.filename);

    fs.writeFileSync(tmpPath, buf);

    try {
      const file = {
        originalname: payload.filename,
        mimetype: payload.mimetype || 'application/octet-stream',
        size: buf.length,
        path: tmpPath,
      } as unknown as Express.Multer.File;

      return await this.uploadFile(file);
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<any> {
    if (!file?.originalname) throw new Error('No file provided');
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) throw new Error('Only PDF and DOCX files are allowed');
    if (file.size > this.maxFileSize) throw new Error(`File size exceeds limit`);
    if (!this.client) throw new Error('S3 service not configured');

    await this.client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
    const s3Key = this.generateUniqueFilename(file.originalname);
    const fileContent = fs.readFileSync(file.path);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: file.mimetype,
        Metadata: {
          original_filename: file.originalname,
          uploaded_at: new Date().toISOString(),
          file_size: String(file.size),
        },
      }),
    );
    await this.client.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: s3Key }));
    const backendUrl = this.config.get<string>('BACKEND_URL') || 'http://localhost:4002';
    const fileUrl = `${backendUrl}/ats-checker/s3/file/${s3Key}`;
    let presignedUrl: string | undefined;
    try {
      presignedUrl = await getSignedUrl(
        this.client,
        new GetObjectCommand({ Bucket: this.bucketName, Key: s3Key }),
        { expiresIn: 3600 },
      );
    } catch (_) { }
    return {
      success: true,
      file_url: fileUrl,
      presigned_url: presignedUrl,
      s3_key: s3Key,
      original_filename: file.originalname,
      file_size: file.size,
      content_type: file.mimetype,
      uploaded_at: new Date().toISOString(),
    };
  }

  async deleteFile(s3Key: string): Promise<boolean> {
    if (!this.client) return false;
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: s3Key }));
    return true;
  }

  async generatePresignedUrl(s3Key: string, expiresIn = 3600): Promise<string | null> {
    if (!this.client) return null;
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucketName, Key: s3Key }),
      { expiresIn },
    );
  }

  async getFileBytes(s3Key: string): Promise<{ data: Buffer; content_type: string; content_length: number; original_filename: string } | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: s3Key }));
      const chunks: Uint8Array[] = [];
      if (response.Body) {
        for await (const chunk of response.Body as any) chunks.push(chunk);
      }
      const data = Buffer.concat(chunks);
      return {
        data,
        content_type: response.ContentType || 'application/octet-stream',
        content_length: response.ContentLength || data.length,
        original_filename: (response.Metadata?.original_filename as string) || s3Key.split('/').pop() || s3Key,
      };
    } catch (err: any) {
      if (err.name === 'NoSuchKey') return null;
      throw err;
    }
  }

  isConfigured(): boolean {
    return !!(this.config.get('AWS_ACCESS_KEY_ID') && this.config.get('AWS_SECRET_ACCESS_KEY') && this.bucketName && this.client);
  }
}
