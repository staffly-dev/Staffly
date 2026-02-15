import { Request, Response } from "express";
import { S3Service } from "../services/s3.service";
import { Env } from "../config/env.config";

export class AWS_S3Controller {
  private s3_service: S3Service;

  constructor() {
    this.s3_service = new S3Service();
  }

  async upload_file(req: Request, res: Response): Promise<Response> {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "No file provided"
        });
      }

      console.log(`Processing file upload: ${file.originalname}`);
      
      // Upload file to S3
      const result = await this.s3_service.upload_file(file);
      
      console.log(`File uploaded successfully: ${result.file_url}`);
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error(`Unexpected error during file upload: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Internal server error: ${error.message}`
      });
    }
  }

  async check_s3_status(req: Request, res: Response): Promise<Response> {
    try {
      const status = {
        configured: this.s3_service.is_configured(),
        bucket_name: Env.AWS_S3_BUCKET,
        region: Env.AWS_REGION,
        bucket_url: Env.AWS_S3_BUCKET_URL || 
          (Env.AWS_S3_BUCKET ? `https://${Env.AWS_S3_BUCKET}.s3.${Env.AWS_REGION}.amazonaws.com` : ""),
        credentials_configured: !!(Env.AWS_ACCESS_KEY_ID && Env.AWS_SECRET_ACCESS_KEY)
      };
      
      return res.status(200).json(status);
    } catch (error: any) {
      console.error(`Error checking S3 status: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Error checking S3 status: ${error.message}`
      });
    }
  }

  async delete_file(req: Request, res: Response): Promise<Response> {
    try {
      const s3_key_param = Array.isArray(req.params.s3_key) ? req.params.s3_key[0] : req.params.s3_key;
      const s3_key = s3_key_param || req.body.s3_key;
      if (!s3_key) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "S3 key is required"
        });
      }

      console.log(`Attempting to delete file from S3: ${s3_key}`);

      // Normalize key: add folder prefix if only filename provided
      const normalized_key = s3_key.includes("/") ? s3_key : `cv_uploads/${s3_key}`;
      console.log(`Normalized S3 key for deletion: ${normalized_key}`);

      const success = await this.s3_service.delete_file(normalized_key);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: `File ${normalized_key} deleted successfully`,
          deleted_at: new Date().toISOString()
        });
      } else {
        return res.status(500).json({
          success: false,
          error: true,
          message: "Failed to delete file from S3"
        });
      }
    } catch (error: any) {
      console.error(`Error deleting file from S3: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Error deleting file: ${error.message}`
      });
    }
  }

  async get_presigned_url(req: Request, res: Response): Promise<Response> {
    try {
      const s3_key_param = Array.isArray(req.params.s3_key) ? req.params.s3_key[0] : req.params.s3_key;
      const s3_key = s3_key_param || (Array.isArray(req.query.s3_key) ? req.query.s3_key[0] : req.query.s3_key) as string;
      const expires_in = parseInt(req.query.expires_in as string) || 3600;
      
      if (!s3_key) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "S3 key is required"
        });
      }

      console.log(`Generating presigned URL for: ${s3_key}`);
      const normalized_key = s3_key.includes("/") ? s3_key : `cv_uploads/${s3_key}`;
      const url = await this.s3_service.generate_presigned_url(normalized_key, expires_in);
      
      if (!url) {
        return res.status(404).json({
          success: false,
          error: true,
          message: `File not found or presign failed: ${normalized_key}`
        });
      }
      
      return res.status(200).json({
        success: true,
        presigned_url: url,
        s3_key: normalized_key,
        expires_in
      });
    } catch (error: any) {
      console.error(`Error generating presigned URL: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Error generating presigned URL: ${error.message}`
      });
    }
  }

  async download_file(req: Request, res: Response): Promise<Response> {
    try {
      const s3_key_param = Array.isArray(req.params.s3_key) ? req.params.s3_key[0] : req.params.s3_key;
      const s3_key = s3_key_param || (Array.isArray(req.query.s3_key) ? req.query.s3_key[0] : req.query.s3_key) as string;
      if (!s3_key) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "S3 key is required"
        });
      }

      const normalized_key = s3_key.includes("/") ? s3_key : `cv_uploads/${s3_key}`;
      const result = await this.s3_service.get_file_bytes(normalized_key);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "File not found"
        });
      }

      const { data, content_type, content_length, original_filename } = result;

      res.setHeader("Content-Type", content_type);
      res.setHeader("Content-Length", content_length.toString());
      res.setHeader("Content-Disposition", `inline; filename="${original_filename}"`);
      
      return res.send(data);
    } catch (error: any) {
      console.error(`Error streaming file: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: "Failed to stream file"
      });
    }
  }
}

