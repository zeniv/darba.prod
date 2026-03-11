import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly endpoint: string;
  private readonly bucket: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly region: string;

  constructor(private config: ConfigService) {
    this.endpoint = this.config.get('S3_ENDPOINT', '');
    this.bucket = this.config.get('S3_BUCKET', 'darba-media');
    this.accessKey = this.config.get('S3_ACCESS_KEY', '');
    this.secretKey = this.config.get('S3_SECRET_KEY', '');
    this.region = this.config.get('S3_REGION', 'auto');
  }

  /** Generate a signed upload URL (pre-signed PUT) */
  async getUploadUrl(key: string, _contentType: string): Promise<string> {
    // TODO: Implement S3-compatible pre-signed URL generation
    // For now, return a placeholder path
    return `${this.endpoint}/${this.bucket}/${key}`;
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
