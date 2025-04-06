import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SearchUserDto {
  @ApiProperty({ example: '진혁', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'kmer1024@hanyang.ac.kr', required: false })
  @IsOptional()
  @IsString()
  email?: string;
}
