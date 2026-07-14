import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PointsCalculatorService } from './points-calculator.service';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';

@Module({
  imports: [AuthModule],
  controllers: [TracksController],
  providers: [TracksService, PointsCalculatorService],
})
export class TracksModule {}
