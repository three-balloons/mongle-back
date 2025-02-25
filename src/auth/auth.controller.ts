import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PostAccessTokenDto } from './dto/request/post-accesstoken.dto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/access')
  async postAccessToken(
    @Body() postAccessTokenDto: PostAccessTokenDto,
  ): Promise<GlobalResponseDto> {
    const response: GlobalResponseDto =
      await this.authService.postAccessToken(postAccessTokenDto);
    return response;
  }

  @Post('/test')
  async postTestAccessToken(): Promise<GlobalResponseDto> {
    const response: GlobalResponseDto =
      await this.authService.postTestAccessToken();
    return response;
  }
}
