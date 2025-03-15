import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostAccessTokenDto } from './dto/request/post-accesstoken.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';

const testOAuthId = '12345test';
const testEmail = 'test@test.com';
const testUser = 'TestUser';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async postAccessToken(
    postAccessTokenDto: PostAccessTokenDto,
  ): Promise<GlobalResponseDto> {
    let accessToken = '';
    if (postAccessTokenDto.provider == 'KAKAO') {
      accessToken = await this.postKakaoAccessToken(postAccessTokenDto);
    } else if (postAccessTokenDto.provider == 'GOOGLE') {
      accessToken = await this.postGoogleAccessToken(postAccessTokenDto);
    } else {
      throw new BadRequestException('AUTH: INAPPROPRIATE PROVIDER');
    }
    return new GlobalResponseDto('OK', '', { accessToken: accessToken });
  }

  private async postKakaoAccessToken(
    request: PostAccessTokenDto,
  ): Promise<string> {
    const kakaoClientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const kakaoClientSecret = this.configService.get<string>(
      'KAKAO_CLIENT_SECRET',
    );
    const response = await firstValueFrom(
      this.httpService.post<any>('https://kauth.kakao.com/oauth/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: kakaoClientId,
          redirect_uri: request.redirect_uri,
          code: request.code,
          client_secret: kakaoClientSecret,
        },
      }),
    );

    const idToken = response.data.id_token;
    const info = this.getInfoFromIdToken(idToken, 'Kakao');
    return this.checkAndSaveUserAndReturnToken(request.provider, info);
  }

  private async postGoogleAccessToken(
    request: PostAccessTokenDto,
  ): Promise<string> {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );

    const response = await firstValueFrom(
      this.httpService.post<any>('https://oauth2.googleapis.com/token', null, {
        params: {
          code: request.code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: request.redirect_uri,
          grant_type: 'authorization_code',
        },
      }),
    );
    const idToken = response.data.id_token;
    const info = this.getInfoFromIdToken(idToken, 'Google');
    return this.checkAndSaveUserAndReturnToken(request.provider, info);
  }

  private getInfoFromIdToken(idToken: string, provider: string): string[] {
    const payloadBase64 = idToken.split('.')[1];
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8'),
    );

    if (!decodedPayload.sub) {
      throw new NotFoundException('AUTH: SUB NOT FOUND');
    }

    const sub = decodedPayload.sub;
    const email = decodedPayload.email || '';
    let name = '';

    if (provider === 'Google') {
      name = decodedPayload.name || '';
    } else if (provider === 'Kakao') {
      name = decodedPayload.nickname || '';
    }

    return [sub, email, name];
  }

  private async checkAndSaveUserAndReturnToken(
    provider: string,
    info: string[],
  ): Promise<string> {
    const [oAuthId, email, name] = info;
    const user = await this.prisma.user.findFirst({
      where: {
        oAuthId,
      },
    });

    if (!user) {
      const user: User = await this.prisma.user.create({
        data: {
          email,
          provider,
          name,
          oAuthId,
        },
      });
      return this.jwtService.sign(
        { sub: user.oAuthId },
        { algorithm: 'HS512' },
      );
    }
    if (!user.deletedAt) {
      return this.jwtService.sign({ sub: oAuthId }, { algorithm: 'HS512' });
    } else {
      throw new BadRequestException('AUTH: DELETED USER');
    }
  }

  async postTestAccessToken(): Promise<GlobalResponseDto> {
    const result: string[] = [testOAuthId, testEmail, testUser];

    const accessToken: string = await this.checkAndSaveUserAndReturnToken(
      'Test',
      result,
    );

    return new GlobalResponseDto('OK', '', { accessToken: accessToken });
  }
}
