import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostWorkspaceDto } from './dto/request/post-workspace.dto';
import { RoleType, User, Workspace } from '@prisma/client';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { WorkspaceResponseDto } from './dto/response/workspace-response.dto';
import { PutWorkspaceDto } from './dto/request/put-workspace.dto';
import { workspaceWithRoles, WorkspaceWithRoles } from './utils/prisma-types';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async postWorkspace(
    user: User,
    postWorkspaceDto: PostWorkspaceDto,
  ): Promise<GlobalResponseDto> {
    const result = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: postWorkspaceDto.name,
          theme: postWorkspaceDto.theme,
        },
      });

      const role = await tx.role.create({
        data: {
          workspace: {
            connect: { id: workspace.id },
          },
          user: {
            connect: { id: user.id },
          },
          roleType: 'OWNER',
        },
      });

      return { workspace, role };
    });

    const workspaceResponseDto: WorkspaceResponseDto = new WorkspaceResponseDto(
      result.workspace,
    );

    return new GlobalResponseDto('OK', '', workspaceResponseDto);
  }

  async getWorkspaces(user: User): Promise<GlobalResponseDto> {
    const workspaces: Workspace[] = await this.prisma.workspace.findMany({
      where: {
        roles: {
          some: {
            userId: user.id,
          },
        },
        deletedAt: null,
      },
    });

    const workspacesResponseDto = workspaces.map(
      (workspace) => new WorkspaceResponseDto(workspace),
    );

    return new GlobalResponseDto('OK', '', workspacesResponseDto);
  }

  async getWorkspaceById(
    user: User,
    workspaceId: string,
  ): Promise<GlobalResponseDto> {
    const workspace: WorkspaceWithRoles = await this.prisma.workspace.findFirst(
      {
        where: {
          uuid: workspaceId,
        },
        ...workspaceWithRoles,
      },
    );

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    const isAuthorized = workspace.roles.some(
      (role) => role.userId === user.id,
    );
    if (!isAuthorized) {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }

    const workspaceResponseDto: WorkspaceResponseDto = new WorkspaceResponseDto(
      workspace,
    );

    return new GlobalResponseDto('OK', '', workspaceResponseDto);
  }

  async getDeletedWorkspaces(user: User) {
    const deletedWorkspaces: Workspace[] = await this.prisma.workspace.findMany(
      {
        where: {
          roles: {
            some: {
              userId: user.id,
            },
          },
          deletedAt: { not: null },
        },
      },
    );

    const workspacesResponseDto = deletedWorkspaces.map(
      (workspace) => new WorkspaceResponseDto(workspace),
    );

    return new GlobalResponseDto('OK', '', workspacesResponseDto);
  }

  async putWorkspaceById(
    user: User,
    workspaceId: string,
    putWorkspaceDto: PutWorkspaceDto,
  ) {
    const workspace: WorkspaceWithRoles = await this.prisma.workspace.findFirst(
      {
        where: { uuid: workspaceId },
        ...workspaceWithRoles,
      },
    );

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    const userRole = workspace.roles.find((role) => role.userId === user.id);

    if (!userRole) {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }

    if (userRole.roleType === RoleType.VIEWER) {
      throw new ForbiddenException('WORKSPACE: INSUFFICIENT PERMISSIONS');
    }

    const updatedWorkspace: Workspace = await this.prisma.workspace.update({
      where: { uuid: workspace.uuid },
      data: {
        name: putWorkspaceDto.name,
        theme: putWorkspaceDto.theme,
      },
    });

    const workspaceResponseDto: WorkspaceResponseDto = new WorkspaceResponseDto(
      updatedWorkspace,
    );

    return new GlobalResponseDto('OK', '', workspaceResponseDto);
  }

  async deleteWorkspaceById(
    user: User,
    workspaceId: string,
  ): Promise<GlobalResponseDto> {
    const workspace: WorkspaceWithRoles = await this.prisma.workspace.findFirst(
      {
        where: { uuid: workspaceId },
        ...workspaceWithRoles,
      },
    );

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    const userRole = workspace.roles.find((role) => role.userId === user.id);

    if (!userRole) {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }

    if (userRole.roleType === RoleType.VIEWER) {
      throw new ForbiddenException('WORKSPACE: INSUFFICIENT PERMISSIONS');
    }

    const updatedWorkspace: Workspace = await this.prisma.workspace.update({
      where: { uuid: workspace.uuid },
      data: {
        deletedAt: new Date(),
      },
    });

    return new GlobalResponseDto('OK', '', { id: updatedWorkspace.uuid });
  }

  async restoreWorkspaceById(
    user: User,
    workspaceId: string,
  ): Promise<GlobalResponseDto> {
    const workspace: WorkspaceWithRoles = await this.prisma.workspace.findFirst(
      {
        where: { uuid: workspaceId },
        ...workspaceWithRoles,
      },
    );

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    const userRole = workspace.roles.find((role) => role.userId === user.id);

    if (!userRole) {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }

    if (userRole.roleType === RoleType.VIEWER) {
      throw new ForbiddenException('WORKSPACE: INSUFFICIENT PERMISSIONS');
    }

    const updatedWorkspace: Workspace = await this.prisma.workspace.update({
      where: { uuid: workspace.uuid },
      data: {
        deletedAt: null,
      },
    });

    return new GlobalResponseDto('OK', '', { id: updatedWorkspace.uuid });
  }
}
