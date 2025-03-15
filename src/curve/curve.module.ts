import { Module } from '@nestjs/common';
import { CurveService } from './curve.service';
import { CurveController } from './curve.controller';

@Module({
  controllers: [CurveController],
  providers: [CurveService],
})
export class CurveModule {}
