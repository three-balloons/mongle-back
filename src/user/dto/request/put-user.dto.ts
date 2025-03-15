import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class PutUserDto {
  @ApiProperty({ example: '진혁' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'kmer1024@hanyang.ac.kr' })
  @IsEmail()
  email: string;
}
