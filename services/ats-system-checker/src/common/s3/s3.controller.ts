import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { S3Service } from './s3.service';

type S3UploadBase64Payload = {
  filename: string;
  mimetype?: string;
  data_base64: string;
};

type S3KeyPayload = {
  s3_key: string;
};

type S3PresignPayload = {
  s3_key: string;
  expires_in?: number;
};

type S3GetFilePayload = {
  s3_key: string;
};

@Controller()
export class S3Controller {
  constructor(
    private s3: S3Service,
    private config: ConfigService,
  ) { }

  @MessagePattern('ats.s3.upload')
  async upload(@Payload() payload: S3UploadBase64Payload) {
    if (!payload?.filename?.trim()) throw new BadRequestException('filename is required');
    if (!payload?.data_base64?.trim()) throw new BadRequestException('data_base64 is required');
    return this.s3.uploadBase64(payload);
  }

  @MessagePattern('ats.s3.status')
  status() {
    return this.s3Status();
  }

  private s3Status() {
    return {
      configured: this.s3.isConfigured(),
      bucket_name: this.config.get('AWS_S3_BUCKET'),
      region: this.config.get('AWS_REGION'),
      bucket_url: this.config.get('AWS_S3_BUCKET_URL') || (this.config.get('AWS_S3_BUCKET') ? `https://${this.config.get('AWS_S3_BUCKET')}.s3.${this.config.get('AWS_REGION')}.amazonaws.com` : ''),
      credentials_configured: !!(this.config.get('AWS_ACCESS_KEY_ID') && this.config.get('AWS_SECRET_ACCESS_KEY')),
    };
  }

  @MessagePattern('ats.s3.delete')
  async delete(@Payload() payload: S3KeyPayload) {
    const key = payload?.s3_key;
    if (!key?.trim()) throw new BadRequestException('s3_key is required');
    const normalized = key.includes('/') ? key : `cv_uploads/${key}`;
    const success = await this.s3.deleteFile(normalized);
    if (!success) throw new InternalServerErrorException('Failed to delete file');
    return { success: true, message: `File ${normalized} deleted successfully`, deleted_at: new Date().toISOString() };
  }

  @MessagePattern('ats.s3.presign')
  async presign(@Payload() payload: S3PresignPayload) {
    if (!payload?.s3_key?.trim()) throw new BadRequestException('s3_key is required');
    const expiresIn = payload.expires_in ?? 3600;
    const normalized = payload.s3_key.includes('/') ? payload.s3_key : `cv_uploads/${payload.s3_key}`;
    const url = await this.s3.generatePresignedUrl(normalized, expiresIn);
    if (!url) throw new NotFoundException('File not found or presign failed');
    return { success: true, presigned_url: url, s3_key: normalized, expires_in: expiresIn };
  }

  @MessagePattern('ats.s3.file.get')
  async file(@Payload() payload: S3GetFilePayload) {
    if (!payload?.s3_key?.trim()) throw new BadRequestException('s3_key is required');
    const normalized = payload.s3_key.includes('/') ? payload.s3_key : `cv_uploads/${payload.s3_key}`;
    const result = await this.s3.getFileBytes(normalized);
    if (!result) throw new NotFoundException('File not found');
    return {
      s3_key: normalized,
      content_type: result.content_type,
      content_length: result.content_length,
      original_filename: result.original_filename,
      data_base64: result.data.toString('base64'),
    };
  }
}
