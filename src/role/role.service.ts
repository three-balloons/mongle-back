import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostRoleDto } from './dto/request/post-role.dto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { Role, RoleType } from '@prisma/client';
import { PutRoleDto } from './dto/request/put-role.dto';
import {
  roleWithUser,
  RoleWithUser,
  roleWithWorkspace,
  RoleWithWorkspace,
} from './utils/prisma-types';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}
  async postRole(
    postRoleDto: PostRoleDto,
    workspaceId: number,
  ): Promise<GlobalResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: {
        userId_workspaceId: {
          userId: postRoleDto.userId,
          workspaceId,
        },
      },
    });

    if (role) {
      throw new BadRequestException('ROLE: ALREADY EXISTS');
    }

    const createdRole: RoleWithWorkspace = await this.prisma.role.create({
      data: {
        user: { connect: { id: postRoleDto.userId } },
        workspace: { connect: { id: workspaceId } },
        roleType: postRoleDto.role,
      },
      ...roleWithWorkspace,
    });

    const filteredRole = {
      roleType: createdRole.roleType,
      userId: createdRole.userId,
      workspaceId: createdRole.workspace.uuid,
    };

    return new GlobalResponseDto('OK', '', filteredRole);
  }

  async putRole(
    putRoleDto: PutRoleDto,
    workspaceId: number,
  ): Promise<GlobalResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: {
        userId_workspaceId: {
          userId: putRoleDto.userId,
          workspaceId,
        },
      },
    });

    if (!role) {
      throw new BadRequestException('ROLE: NOT FOUND');
    }

    if (role.roleType == RoleType.OWNER) {
      throw new BadRequestException('ROLE: ROLETYPE OWNER CANNOT BE CHANGED');
    }

    const changedRole: RoleWithWorkspace = await this.prisma.role.update({
      where: {
        userId_workspaceId: {
          userId: putRoleDto.userId,
          workspaceId,
        },
      },
      data: {
        roleType: putRoleDto.role,
      },
      ...roleWithWorkspace,
    });

    const filteredRole = {
      roleType: changedRole.roleType,
      userId: changedRole.userId,
      workspaceId: changedRole.workspace.uuid,
    };

    return new GlobalResponseDto('OK', '', filteredRole);
  }

  async deleteRole(
    userId: number,
    workspaceId: number,
  ): Promise<GlobalResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!role) {
      throw new BadRequestException('ROLE: NOT FOUND');
    }

    if (role.roleType == RoleType.OWNER) {
      throw new BadRequestException('ROLE: ROLETYPE OWNER CANNOT BE DELETED');
    }

    await this.prisma.role.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return new GlobalResponseDto('OK', '', null);
  }

  async getRolesByWorkspaceId(workspaceId: string): Promise<GlobalResponseDto> {
    const roles: RoleWithUser[] = await this.prisma.role.findMany({
      where: { workspace: { uuid: workspaceId } },
      ...roleWithUser,
    });

    const groupedRoles = {
      owner: [] as { email: string; name: string }[],
      editor: [] as { email: string; name: string }[],
      viewer: [] as { email: string; name: string }[],
    };

    roles.forEach((role) => {
      const key = role.roleType.toLowerCase() as keyof typeof groupedRoles;
      if (groupedRoles[key]) {
        const { oAuthId, refreshToken, ...filteredUser } = role.user;
        groupedRoles[key].push(filteredUser);
      }
    });

    return new GlobalResponseDto('OK', '', groupedRoles);
  }
}
