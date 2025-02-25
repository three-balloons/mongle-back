import { PartialType } from '@nestjs/swagger';
import { CreateBubbleDto } from './create-bubble.dto';

export class UpdateBubbleDto extends PartialType(CreateBubbleDto) {}
