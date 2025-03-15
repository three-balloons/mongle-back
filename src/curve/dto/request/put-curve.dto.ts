import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { ConfigDto } from './post-curve.dto';

export class PutCurveDto {
  @IsString()
  @ApiProperty({ example: 'abcdefabcdefabcdef' })
  position: any;

  @ValidateNested()
  @IsObject()
  @Type(() => ConfigDto)
  @ApiProperty({ type: ConfigDto })
  config: ConfigDto;

  @IsNumber()
  @ApiProperty({ example: '123' })
  bubbleId: number;
}
