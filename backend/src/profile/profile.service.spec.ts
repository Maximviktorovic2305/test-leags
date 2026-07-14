import {
  NotFoundException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { PrismaService } from '../common/database/prisma.service';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new ProfileService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('returns profile statistics without avatar bytes', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      nickname: 'Скала',
      gender: 'FEMALE',
      league: 'GREEN',
      points: 120,
      avatarUpdatedAt: null,
      _count: { completions: 3 },
    });

    await expect(service.getProfile('user-1')).resolves.toEqual(
      expect.objectContaining({
        completedTracks: 3,
        hasAvatar: false,
        nickname: 'Скала',
        points: 120,
      }),
    );
  });

  it('rejects a profile request for a missing user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getProfile('missing')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('stores a validated image with a server-detected MIME type', async () => {
    prisma.user.update.mockResolvedValue({ id: 'user-1' });
    const buffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    await expect(
      service.updateAvatar('user-1', {
        buffer,
        mimetype: 'application/octet-stream',
        originalname: '../../avatar.html',
        size: buffer.length,
      }),
    ).resolves.toEqual(expect.objectContaining({ hasAvatar: true }));

    expect(prisma.user.update).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(prisma.user.update.mock.calls)).toContain(
      '"avatarMimeType":"image/png"',
    );
  });

  it('rejects content whose bytes are not an allowed image', async () => {
    const promise = service.updateAvatar('user-1', {
      buffer: Buffer.from('<svg onload="alert(1)">'),
      mimetype: 'image/png',
      originalname: 'avatar.png',
      size: 24,
    });
    await expect(promise).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('returns stored avatar bytes and handles an absent avatar', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      avatarData: Uint8Array.from([0xff, 0xd8, 0xff]),
      avatarMimeType: 'image/jpeg',
    });
    await expect(service.getAvatar('user-1')).resolves.toEqual({
      data: Buffer.from([0xff, 0xd8, 0xff]),
      mimeType: 'image/jpeg',
    });

    prisma.user.findUnique.mockResolvedValueOnce({
      avatarData: null,
      avatarMimeType: null,
    });
    await expect(service.getAvatar('user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
