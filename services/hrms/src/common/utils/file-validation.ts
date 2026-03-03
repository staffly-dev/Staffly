import { BadRequestException, Logger } from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export class FileValidationUtil {
  private static readonly logger = new Logger(FileValidationUtil.name);

  private static readonly DEFAULT_CONFIGS = {
    avatar: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    },
    document: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ],
      allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'],
    },
    resume: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      allowedExtensions: ['pdf', 'doc', 'docx', 'txt'],
    },
  };

  static validateFile(
    file: any,
    type: 'avatar' | 'document' | 'resume' = 'document',
  ): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const config = this.DEFAULT_CONFIGS[type];

    // Check file size
    if (file.size > config.maxSize) {
      this.logger.warn(`File size exceeded: ${file.size} bytes for type: ${type}`);
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${config.maxSize / (1024 * 1024)}MB`,
      );
    }

    // Check MIME type
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`Invalid MIME type: ${file.mimetype} for type: ${type}`);
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
      );
    }

    // Check file extension
    const extension = file.originalname?.split('.').pop()?.toLowerCase();
    if (!extension || !config.allowedExtensions.includes(extension)) {
      this.logger.warn(`Invalid file extension: ${extension} for type: ${type}`);
      throw new BadRequestException(
        `Invalid file extension. Allowed extensions: ${config.allowedExtensions.join(', ')}`,
      );
    }

    // Basic content validation
    this.validateFileContent(file);
  }

  private static validateFileContent(file: any): void {
    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('Invalid file content');
    }

    // Check for executable signatures
    const executableSignatures = [
      Buffer.from([0x4d, 0x5a]), // PE executable
      Buffer.from([0x7f, 0x45, 0x4c, 0x46]), // ELF executable
      Buffer.from([0xca, 0xfe, 0xba, 0xbe]), // Java class
    ];

    for (const signature of executableSignatures) {
      if (file.buffer.subarray(0, signature.length).equals(signature)) {
        this.logger.warn(`Executable file detected: ${file.originalname}`);
        throw new BadRequestException('Executable files are not allowed');
      }
    }

    // Additional checks for PDF files
    if (file.mimetype === 'application/pdf') {
      const content = file.buffer.toString('utf8', 0, Math.min(10, file.buffer.length));
      if (!content.startsWith('%PDF-')) {
        this.logger.warn(`Invalid PDF file detected: ${file.originalname}`);
        throw new BadRequestException('Invalid PDF file');
      }
    }
  }

  static sanitizeFileName(fileName: string): string {
    // Remove dangerous characters and preserve safe ones
    return fileName
      .replace(/[^a-zA-Z0-9.-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  static generateSecureFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const sanitized = this.sanitizeFileName(originalName);
    const extension = sanitized.split('.').pop();
    const baseName = sanitized.split('.').slice(0, -1).join('.');

    return `${userId}_${timestamp}_${baseName}.${extension}`;
  }
}
