import { SetMetadata } from '@nestjs/common';
import { ADMIN_ONLY_KEY } from './admin.guard';

/**
 * Mark an endpoint as admin-only — managers cannot access it.
 * Use on POST/PATCH/DELETE endpoints where managers should only have read access.
 */
export const AdminOnly = () => SetMetadata(ADMIN_ONLY_KEY, true);
