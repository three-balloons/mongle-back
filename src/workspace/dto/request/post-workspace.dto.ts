import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PostWorkspaceDto {
  @ApiProperty({ example: '진혁 작업공간1' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'pink' })
  @IsString()
  theme: string;
}
