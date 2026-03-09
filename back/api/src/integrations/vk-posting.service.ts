import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VK_API_VERSION = '5.199';
const VK_API_URL = 'https://api.vk.com/method';

interface VkWallPostResult {
  ok: boolean;
  postId?: number;
  error?: string;
}

@Injectable()
export class VkPostingService {
  private readonly logger = new Logger(VkPostingService.name);

  constructor(private prisma: PrismaService) {}

  /** Post to user's VK wall */
  async postToWall(
    userId: string,
    message: string,
    attachments?: string[],
  ): Promise<VkWallPostResult> {
    const token = await this.getUserVkToken(userId);
    if (!token) {
      return { ok: false, error: 'VK not connected' };
    }

    try {
      const params = new URLSearchParams({
        access_token: token,
        v: VK_API_VERSION,
        message,
      });

      if (attachments?.length) {
        params.set('attachments', attachments.join(','));
      }

      const res = await fetch(`${VK_API_URL}/wall.post`, {
        method: 'POST',
        body: params,
      });
      const data = await res.json();

      if (data.error) {
        this.logger.warn(`VK wall.post failed: ${data.error.error_msg}`);
        return { ok: false, error: data.error.error_msg };
      }

      this.logger.log(`VK wall post created: ${data.response.post_id} for user ${userId}`);
      return { ok: true, postId: data.response.post_id };
    } catch (err) {
      this.logger.error(`VK posting error: ${err}`);
      return { ok: false, error: 'VK API request failed' };
    }
  }

  /** Upload photo to VK and return attachment string */
  async uploadPhoto(userId: string, imageUrl: string): Promise<string | null> {
    const token = await this.getUserVkToken(userId);
    if (!token) return null;

    try {
      // 1. Get upload server
      const serverRes = await fetch(
        `${VK_API_URL}/photos.getWallUploadServer?access_token=${token}&v=${VK_API_VERSION}`,
      );
      const serverData = await serverRes.json();
      if (serverData.error) return null;

      const uploadUrl = serverData.response.upload_url;

      // 2. Download image and upload to VK
      const imageRes = await fetch(imageUrl);
      const imageBlob = await imageRes.blob();

      const form = new FormData();
      form.append('photo', imageBlob, 'image.jpg');

      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: form });
      const uploadData = await uploadRes.json();

      // 3. Save photo
      const saveParams = new URLSearchParams({
        access_token: token,
        v: VK_API_VERSION,
        server: String(uploadData.server),
        photo: uploadData.photo,
        hash: uploadData.hash,
      });

      const saveRes = await fetch(`${VK_API_URL}/photos.saveWallPhoto`, {
        method: 'POST',
        body: saveParams,
      });
      const saveData = await saveRes.json();

      if (saveData.error) return null;

      const photo = saveData.response[0];
      return `photo${photo.owner_id}_${photo.id}`;
    } catch (err) {
      this.logger.error(`VK photo upload error: ${err}`);
      return null;
    }
  }

  /** Check if user has active VK connection */
  async isConnected(userId: string): Promise<boolean> {
    return !!(await this.getUserVkToken(userId));
  }

  private async getUserVkToken(userId: string): Promise<string | null> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_type_provider: { userId, type: 'social', provider: 'vk' } },
    });
    if (!integration?.isActive || !integration.encryptedKey) return null;
    return integration.encryptedKey;
  }
}
