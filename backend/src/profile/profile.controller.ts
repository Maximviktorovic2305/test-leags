import {
  Controller,
  Get,
  Header,
  Put,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AVATAR_FIELD_NAME, MAX_AVATAR_SIZE_BYTES } from './profile.constants';
import { ProfileService } from './profile.service';
import type { UploadedAvatar } from './profile.types';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@GetUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Get('avatar')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async getAvatar(@GetUser('id') userId: string) {
    const avatar = await this.profileService.getAvatar(userId);
    return new StreamableFile(avatar.data, {
      type: avatar.mimeType,
      disposition: 'inline; filename="avatar"',
    });
  }

  @Put('avatar')
  @UseInterceptors(
    FileInterceptor(AVATAR_FIELD_NAME, {
      limits: { fileSize: MAX_AVATAR_SIZE_BYTES, files: 1 },
    }),
  )
  updateAvatar(
    @GetUser('id') userId: string,
    @UploadedFile() file?: UploadedAvatar,
  ) {
    return this.profileService.updateAvatar(userId, file);
  }
}
