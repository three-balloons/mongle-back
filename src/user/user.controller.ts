import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from './guard/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { GetUser } from 'src/utils/decorator/get-user.decorator';
import { PutUserDto } from './dto/request/put-user.dto';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  getUser(@GetUser() user): GlobalResponseDto {
    const { oAuthId, refreshToken, ...filteredUser } = user;
    return new GlobalResponseDto('OK', '', filteredUser);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  async putUser(
    @GetUser() user,
    @Body() putUserDto: PutUserDto,
  ): Promise<GlobalResponseDto> {
    return await this.userService.putUser(user, putUserDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  async deleteUser(@GetUser() user): Promise<GlobalResponseDto> {
    return await this.userService.deleteUser(user);
  }

  @Patch('/:userId/restore')
  async restoreUser(
    @Param('userId') userId: number,
  ): Promise<GlobalResponseDto> {
    return await this.userService.restoreUser(userId);
  }
}
