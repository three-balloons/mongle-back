import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostRoleDto } from './dto/request/post-role.dto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { Role } from '@prisma/client';
import { PutRoleDto } from './dto/request/put-role.dto';
import { DeleteRoleDto } from './dto/request/delete-role.dto';
import { RoleWithUsers, roleWithUsers } from './utils/prisma-types';

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

    const createdRole: Role = await this.prisma.role.create({
      data: {
        user: { connect: { id: postRoleDto.userId } },
        workspace: { connect: { id: workspaceId } },
        roleType: postRoleDto.role,
      },
    });

    return new GlobalResponseDto('OK', '', createdRole);
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

    const changedRole = await this.prisma.role.update({
      where: {
        userId_workspaceId: {
          userId: putRoleDto.userId,
          workspaceId,
        },
      },
      data: {
        roleType: putRoleDto.role,
      },
    });

    return new GlobalResponseDto('OK', '', changedRole);
  }

  async deleteRole(
    deleteRoleDto: DeleteRoleDto,
    workspaceId: number,
  ): Promise<GlobalResponseDto> {
    await this.prisma.role.delete({
      where: {
        userId_workspaceId: {
          userId: deleteRoleDto.userId,
          workspaceId,
        },
      },
    });

    return new GlobalResponseDto('OK', '', null);
  }

  async getRolesByWorkspaceId(workspaceId: string): Promise<GlobalResponseDto> {
    const roles: RoleWithUsers[] = await this.prisma.role.findMany({
      where: { workspace: { uuid: workspaceId } },
      ...roleWithUsers,
    });

    const groupedRoles = {
      OWNER: [] as { email: string; name: string }[],
      EDITOR: [] as { email: string; name: string }[],
      VIEWER: [] as { email: string; name: string }[],
    };

    roles.forEach((role) => {
      const key = role.roleType as keyof typeof groupedRoles;
      if (groupedRoles[key]) {
        groupedRoles[key].push({
          email: role.user.email,
          name: role.user.name,
        });
      }
    });

    return new GlobalResponseDto('OK', '', groupedRoles);
  }
}
