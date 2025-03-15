import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      algorithms: ['HS512'],
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userService.findByOAuthId(payload.sub);
    if (!user) {
      throw new UnauthorizedException('AUTHORIZATON: INVALID TOKEN');
    }
    return user;
  }
}
