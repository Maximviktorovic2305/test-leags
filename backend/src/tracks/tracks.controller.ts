import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompleteTrackDto } from './dto/complete-track.dto';
import { RateTrackDto } from './dto/rate-track.dto';
import { TracksService } from './tracks.service';

@Controller('tracks')
@UseGuards(JwtAuthGuard)
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  getTracks(@GetUser('id') userId: string) {
    return this.tracksService.getTracks(userId);
  }

  @Post(':trackId/completions')
  completeTrack(
    @GetUser('id') userId: string,
    @Param('trackId') trackId: string,
    @Body() dto: CompleteTrackDto,
  ) {
    return this.tracksService.completeTrack(userId, trackId, dto);
  }

  @Put(':trackId/rating')
  rateTrack(
    @GetUser('id') userId: string,
    @Param('trackId') trackId: string,
    @Body() dto: RateTrackDto,
  ) {
    return this.tracksService.rateTrack(userId, trackId, dto);
  }
}
