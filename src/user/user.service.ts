import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PutUserDto } from './dto/request/put-user.dto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByOAuthId(oAuthId: string): Promise<User> {
    return await this.prisma.user.findFirst({
      where: { oAuthId, deletedAt: null },
    });
  }

  async putUser(
    user: User,
    putUserDto: PutUserDto,
  ): Promise<GlobalResponseDto> {
    const { name, email } = putUserDto;

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
      },
    });
    const { oAuthId, refreshToken, ...filteredUser } = updatedUser;
    return new GlobalResponseDto('OK', '', filteredUser);
  }

  async deleteUser(user: User): Promise<GlobalResponseDto> {
    const deletedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return new GlobalResponseDto('OK', '', { id: deletedUser.id });
  }

  async restoreUser(userId: number): Promise<GlobalResponseDto> {
    const restoredUser = await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    return new GlobalResponseDto('OK', '', { id: restoredUser.id });
  }
}
