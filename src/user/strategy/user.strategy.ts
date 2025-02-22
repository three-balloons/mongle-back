import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';

@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'yourSecretKey',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
