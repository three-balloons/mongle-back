import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class PutRoleDto {
  @ApiProperty({ example: '1' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'VIEWER', enum: RoleType })
  @IsEnum(RoleType)
  role: RoleType;
}
