import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidPath', async: false })
export class ValidatePathConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (value.length > 255) {
      throw new BadRequestException('BUBBLE: PATH TOO LONG');
    }
    if (!value.includes('/') || value.endsWith('/')) {
      throw new BadRequestException('BUBBLE: WRONG PATH');
    }
    return true;
  }
}

export class PostBubbleDto {
  @ApiProperty({ example: '/Bubble1/Bubble3' })
  @IsString()
  @Validate(ValidatePathConstraint)
  path: string;

  @ApiProperty({ example: '버블 이름' })
  @IsString()
  name: string;

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
}
