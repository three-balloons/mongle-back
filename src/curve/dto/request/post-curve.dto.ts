import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';

export class ConfigDto {
  @IsNumber()
  @ApiProperty({ example: '12' })
  thickness: number;

  @IsString()
  @ApiProperty({ example: 'Blue' })
  color: string;
}

export class PostCurveDto {
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
