import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { RoleGuard } from 'src/user/guard/role.guard';
import { RoleService } from './role.service';
import { RoleType, User, Workspace } from '@prisma/client';
import { PostRoleDto } from './dto/request/post-role.dto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { Roles } from 'src/utils/decorator/role.decorator';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';
import { PutRoleDto } from './dto/request/put-role.dto';

@Controller('api/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiBearerAuth('jwt')
  @ApiHeader({
    name: 'workspaceId',
    description: 'workspaceId',
    required: true,
  })
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleType.OWNER)
  async postRole(
    @Body() postRoleDto: PostRoleDto,
    @GetWorkspace() workspace: Workspace,
  ): Promise<GlobalResponseDto> {
    return await this.roleService.postRole(postRoleDto, workspace.id);
  }

  @ApiBearerAuth('jwt')
  @ApiHeader({
    name: 'workspaceId',
    description: 'workspaceId',
    required: true,
  })
  @Put()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleType.OWNER)
  async putRole(
    @Body() putRoleDto: PutRoleDto,
    @GetWorkspace() workspace: Workspace,
  ): Promise<GlobalResponseDto> {
    return await this.roleService.putRole(putRoleDto, workspace.id);
  }

  @ApiBearerAuth('jwt')
  @ApiHeader({
    name: 'workspaceId',
    description: 'workspaceId',
    required: true,
  })
  @Delete('/:userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleType.OWNER)
  async deleteRole(
    @Param('userId') userId: number,
    @GetWorkspace() workspace: Workspace,
  ): Promise<GlobalResponseDto> {
    return await this.roleService.deleteRole(userId, workspace.id);
  }

  @ApiBearerAuth('jwt')
  @ApiHeader({
    name: 'workspaceId',
    description: 'workspaceId',
    required: true,
  })
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RoleType.VIEWER, RoleType.EDITOR, RoleType.OWNER)
  async getRole(@Req() req: Request): Promise<GlobalResponseDto> {
    return new GlobalResponseDto('OK', '', req['userRole']);
  }

  @ApiBearerAuth('jwt')
  @Get('/:workspaceId')
  @UseGuards(JwtAuthGuard)
  async getRoleByWorkspaceId(
    @Param('workspaceId') workspaceId: string,
  ): Promise<GlobalResponseDto> {
    return await this.roleService.getRolesByWorkspaceId(workspaceId);
  }
}
