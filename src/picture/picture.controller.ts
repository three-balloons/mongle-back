import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Patch,
  Get,
} from '@nestjs/common';
import { PictureService } from './picture.service';
import { PostPictureDto } from './dto/request/post-picture.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { RoleGuard } from 'src/user/guard/role.guard';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { GetUser } from 'src/utils/decorator/get-user.decorator';
import { RoleType, User, Workspace } from '@prisma/client';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { Roles } from 'src/utils/decorator/role.decorator';

@Controller('/api/pictures')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('jwt')
@ApiHeader({
  name: 'workspaceId',
  description: 'workspaceId',
  required: true,
})
export class PictureController {
  constructor(private readonly pictureService: PictureService) {}

  @Post()
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async postPicture(
    @GetUser() user: User,
    @GetWorkspace() workspace: Workspace,
    @Body() postPictureDto: PostPictureDto,
  ): Promise<GlobalResponseDto> {
    return await this.pictureService.postPicture(
      user,
      workspace,
      postPictureDto,
    );
  }

  @Get('/:pictureId')
  @Roles(RoleType.VIEWER, RoleType.EDITOR, RoleType.OWNER)
  async getPictureById(
    @Param('pictureId') pictureId: number,
  ): Promise<GlobalResponseDto> {
    return await this.pictureService.getPictureById(pictureId);
  }

  @Delete('/:pictureId')
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async deletePicture(
    @GetWorkspace() workspace: Workspace,
    @Param('pictureId') pictureId: number,
  ): Promise<GlobalResponseDto> {
    return await this.pictureService.deletePictureById(workspace, pictureId);
  }

  @Patch('/:pictureId/restore')
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async restorePicture(
    @GetWorkspace() workspace: Workspace,
    @Param('pictureId') pictureId: number,
  ): Promise<GlobalResponseDto> {
    return this.pictureService.restorePictureById(workspace, pictureId);
  }
}
