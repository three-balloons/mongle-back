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
import { WorkspaceGuard } from 'src/workspace/guard/workspace.guard';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { GetUser } from 'src/utils/decorator/get-user.decorator';
import { User, Workspace } from '@prisma/client';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';

@Controller('/api/pictures')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@ApiBearerAuth('jwt')
@ApiHeader({
  name: 'workspaceId',
  description: 'workspaceId',
  required: true,
})
export class PictureController {
  constructor(private readonly pictureService: PictureService) {}

  @Post()
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
  async getPictureById(
    @Param('pictureId') pictureId: number,
  ): Promise<GlobalResponseDto> {
    return await this.pictureService.getPictureById(pictureId);
  }

  @Delete('/:pictureId')
  async deletePicture(
    @GetWorkspace() workspace: Workspace,
    @Param('pictureId') pictureId: number,
  ): Promise<GlobalResponseDto> {
    return await this.pictureService.deletePictureById(workspace, pictureId);
  }

  @Patch('/:pictureId/restore')
  async restorePicture(
    @GetWorkspace() workspace: Workspace,
    @Param('pictureId') pictureId: number,
  ): Promise<GlobalResponseDto> {
    return this.pictureService.restorePictureById(workspace, pictureId);
  }
}
