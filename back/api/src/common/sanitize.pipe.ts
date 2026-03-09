import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/** Strip HTML tags and trim whitespace from string fields in request body */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' || typeof value !== 'object' || !value) {
      return value;
    }
    return this.sanitizeObject(value);
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.stripHtml(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, val] of Object.entries(obj)) {
        result[key] = this.sanitizeObject(val);
      }
      return result;
    }
    return obj;
  }

  private stripHtml(str: string): string {
    return str
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }
}
