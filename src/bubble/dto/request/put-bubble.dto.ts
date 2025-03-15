import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidPutPath', async: false })
class ValidatePathConstraint implements ValidatorConstraintInterface {
  validate(value: string | null | undefined, args: ValidationArguments) {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    if (value.length > 255) {
      throw new BadRequestException('BUBBLE: PATH TOO LONG');
    }
    if (!value.includes('/') || value.endsWith('/')) {
      throw new BadRequestException('BUBBLE: WRONG PATH');
    }
    return true;
  }
}
export class PutBubbleDto {
  @ApiPropertyOptional({ example: '/Bubble1/Bubble3' })
  @IsString()
  @IsOptional()
  @Validate(ValidatePathConstraint)
  newPath?: string;

  @ApiProperty({ example: '수정할 버블 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: '50' })
  @IsNumber()
  top: number;

  @ApiProperty({ example: '120' })
  @IsNumber()
  left: number;

  @ApiProperty({ example: '-100' })
  @IsNumber()
  width: number;

  @ApiProperty({ example: '0' })
  @IsNumber()
  height: number;
}
