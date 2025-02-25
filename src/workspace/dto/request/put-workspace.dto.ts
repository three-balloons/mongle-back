import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PutWorkspaceDto {
  @ApiProperty({ example: '진혁 수정 작업공간2' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Blue' })
  @IsString()
  theme: string;
}
