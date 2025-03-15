import { Module } from '@nestjs/common';
import { BubbleService } from './bubble.service';
import { BubbleController } from './bubble.controller';

@Module({
  controllers: [BubbleController],
  providers: [BubbleService],
})
export class BubbleModule {}
