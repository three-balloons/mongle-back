import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PostWorkspaceDto } from './dto/request/post-workspace.dto';
import { GetUser } from 'src/utils/decorator/get-user.decorator';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { User } from '@prisma/client';
import { PutWorkspaceDto } from './dto/request/put-workspace.dto';

@Controller('api/workspaces')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  async postWorkspace(
    @GetUser() user,
    @Body() postWorkspaceDto: PostWorkspaceDto,
  ): Promise<GlobalResponseDto> {
    return this.workspaceService.postWorkspace(user, postWorkspaceDto);
  }

  @Get()
  async getWorkspaces(@GetUser() user): Promise<GlobalResponseDto> {
    return this.workspaceService.getWorkspaces(user);
  }

  @Get('/deleted')
  async getDeletedWorkspaces(
    @GetUser() user: User,
  ): Promise<GlobalResponseDto> {
    return this.workspaceService.getDeletedWorkspaces(user);
  }

  @Get('/:workspaceId')
  async getWorkspaceById(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<GlobalResponseDto> {
    return this.workspaceService.getWorkspaceById(user, workspaceId);
  }

  @Put('/:workspaceId')
  async putWorkspaceById(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
    @Body() putWorkspaceDto: PutWorkspaceDto,
  ): Promise<GlobalResponseDto> {
    return this.workspaceService.putWorkspaceById(
      user,
      workspaceId,
      putWorkspaceDto,
    );
  }

  @Delete('/:workspaceId')
  async deleteWorkspaceById(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<GlobalResponseDto> {
    return this.workspaceService.deleteWorkspaceById(user, workspaceId);
  }

  @Patch('/:workspaceId/restore')
  async restoreWorkspaceById(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ): Promise<GlobalResponseDto> {
    return this.workspaceService.restoreWorkspaceById(user, workspaceId);
  }
}
