import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly endpoint: string;
  private readonly bucket: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly region: string;
  private s3?: S3Client;

  constructor(private config: ConfigService) {
    this.endpoint = this.config.get('S3_ENDPOINT', '');
    this.bucket = this.config.get('S3_BUCKET', 'darba-media');
    this.accessKey = this.config.get('S3_ACCESS_KEY', '');
    this.secretKey = this.config.get('S3_SECRET_KEY', '');
    this.region = this.config.get('S3_REGION', 'auto');

    if (this.isConfigured()) {
      this.s3 = new S3Client({
        endpoint: this.endpoint,
        region: this.region,
        credentials: {
          accessKeyId: this.accessKey,
          secretAccessKey: this.secretKey,
        },
        forcePathStyle: true,
      });
      this.logger.log('S3 client initialized');
    } else {
      this.logger.warn('S3 credentials not configured — file uploads disabled');
    }
  }

  /** Check whether S3 credentials are present */
  isConfigured(): boolean {
    return !!(this.endpoint && this.accessKey && this.secretKey);
  }

  /** Generate a pre-signed PUT URL (15 min expiry) */
  async getUploadUrl(key: string, contentType: string): Promise<string> {
    if (!this.s3) {
      this.logger.warn('getUploadUrl called without S3 configured');
      return `${this.endpoint || 'https://storage.yandexcloud.net'}/${this.bucket}/${key}`;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 900 });
  }

  /** Generate a pre-signed GET URL (1 hour expiry) */
  async getDownloadUrl(key: string): Promise<string> {
    if (!this.s3) {
      this.logger.warn('getDownloadUrl called without S3 configured');
      return `${this.endpoint || 'https://storage.yandexcloud.net'}/${this.bucket}/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  /** Get public URL for stored file */
  getPublicUrl(key: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    // GCS
    return `https://storage.googleapis.com/${this.bucket}/${key}`;
  }

  /** Generate a unique key for AI result storage */
  generateKey(userId: string, type: string, ext: string): string {
    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    return `ai-results/${userId}/${type}/${timestamp}-${rand}.${ext}`;
  }
}
