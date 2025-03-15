import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class PostPictureDto {
  @ApiProperty({ example: '100' })
  @IsNumber()
  top: number;

  @ApiProperty({ example: '100' })
  @IsNumber()
  left: number;

  @ApiProperty({ example: '100' })
  @IsNumber()
  width: number;

  @ApiProperty({ example: '100' })
  @IsNumber()
  height: number;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  isFlippedX: boolean;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  isFlippedY: boolean;

  @ApiProperty({ example: '15' })
  @IsNumber()
  angle: number;

  @ApiProperty({ example: '123' })
  @IsNumber()
  bubbleId: number;

  @ApiProperty({ example: '3' })
  @IsNumber()
  fileId: number;
}
