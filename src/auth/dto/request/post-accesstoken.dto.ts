import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PostAccessTokenDto {
  @ApiProperty({ example: 'KAKAO' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'authorization_code' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'https://your-redirect-uri.com/callback' })
  @IsString()
  redirect_uri: string;
}
