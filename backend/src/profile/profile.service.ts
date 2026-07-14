import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { detectAvatarMimeType } from './lib/detect-avatar-mime-type';
import type { StoredAvatar, UploadedAvatar } from './profile.types';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        gender: true,
        league: true,
        points: true,
        avatarUpdatedAt: true,
        _count: { select: { completions: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');

    const { _count, ...profile } = user;
    return {
      ...profile,
      completedTracks: _count.completions,
      hasAvatar: Boolean(profile.avatarUpdatedAt),
    };
  }

  async updateAvatar(userId: string, file?: UploadedAvatar) {
    if (!file?.buffer.length) {
      throw new UnsupportedMediaTypeException(
        'Выберите изображение PNG, JPEG или WebP',
      );
    }

    const detectedMimeType = detectAvatarMimeType(file.buffer);
    if (!detectedMimeType) {
      throw new UnsupportedMediaTypeException(
        'Разрешены только изображения PNG, JPEG или WebP',
      );
    }

    const avatarUpdatedAt = new Date();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarData: Uint8Array.from(file.buffer),
        avatarMimeType: detectedMimeType,
        avatarUpdatedAt,
      },
      select: { id: true },
    });

    return { avatarUpdatedAt, hasAvatar: true } as const;
  }

  async getAvatar(userId: string): Promise<StoredAvatar> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarData: true, avatarMimeType: true },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');
    if (!user.avatarData || !user.avatarMimeType) {
      throw new NotFoundException('Фото профиля не загружено');
    }

    return {
      data: Buffer.from(user.avatarData),
      mimeType: user.avatarMimeType,
    };
  }
}
