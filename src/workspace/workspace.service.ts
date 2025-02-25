import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostWorkspaceDto } from './dto/request/post-workspace.dto';
import { User, Workspace } from '@prisma/client';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { WorkspaceResponseDto } from './dto/response/workspace-response.dto';
import { PutWorkspaceDto } from './dto/request/put-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async postWorkspace(
    user: User,
    postWorkspaceDto: PostWorkspaceDto,
  ): Promise<GlobalResponseDto> {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: postWorkspaceDto.name,
        theme: postWorkspaceDto.theme,
        user: {
          connect: { id: user.id },
        },
      },
    });
    const workspaceResponseDto: WorkspaceResponseDto = new WorkspaceResponseDto(
      workspace,
    );

    return new GlobalResponseDto('OK', '', workspaceResponseDto);
  }

  async getWorkspaces(user: User): Promise<GlobalResponseDto> {
    const workspaces: Workspace[] = await this.prisma.workspace.findMany({
      where: { userId: user.id, deletedAt: null },
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
    const workspace: Workspace = await this.prisma.workspace.findFirst({
      where: { uuid: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    if (user.id == workspace.userId) {
      const workspaceResponseDto: WorkspaceResponseDto =
        new WorkspaceResponseDto(workspace);

      return new GlobalResponseDto('OK', '', workspaceResponseDto);
    } else {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }
  }

  async getDeletedWorkspaces(user: User) {
    const deletedWorkspaces: Workspace[] = await this.prisma.workspace.findMany(
      {
        where: { userId: user.id, deletedAt: { not: null } },
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
    const workspace: Workspace = await this.prisma.workspace.findFirst({
      where: { uuid: workspaceId, deletedAt: null },
    });

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    if (user.id == workspace.userId) {
      const updatedWorkspace: Workspace = await this.prisma.workspace.update({
        where: { uuid: workspace.uuid },
        data: {
          name: putWorkspaceDto.name,
          theme: putWorkspaceDto.theme,
        },
      });

      const workspaceResponseDto: WorkspaceResponseDto =
        new WorkspaceResponseDto(updatedWorkspace);

      return new GlobalResponseDto('OK', '', workspaceResponseDto);
    } else {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }
  }

  async deleteWorkspaceById(
    user: User,
    workspaceId: string,
  ): Promise<GlobalResponseDto> {
    const workspace: Workspace = await this.prisma.workspace.findFirst({
      where: { uuid: workspaceId, deletedAt: null },
    });

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    if (user.id == workspace.userId) {
      const updatedWorkspace: Workspace = await this.prisma.workspace.update({
        where: { uuid: workspace.uuid },
        data: {
          deletedAt: new Date(),
        },
      });

      return new GlobalResponseDto('OK', '', { id: updatedWorkspace.uuid });
    } else {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }
  }

  async restoreWorkspaceById(
    user: User,
    workspaceId: string,
  ): Promise<GlobalResponseDto> {
    const workspace: Workspace = await this.prisma.workspace.findFirst({
      where: { uuid: workspaceId, deletedAt: { not: null } },
    });

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    if (user.id == workspace.userId) {
      const updatedWorkspace: Workspace = await this.prisma.workspace.update({
        where: { uuid: workspace.uuid },
        data: {
          deletedAt: null,
        },
      });

      return new GlobalResponseDto('OK', '', { id: updatedWorkspace.uuid });
    } else {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }
  }
}
