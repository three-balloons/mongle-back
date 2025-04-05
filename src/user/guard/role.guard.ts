import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Workspace } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const workspaceId = request.headers['workspaceid'];

    if (!workspaceId) {
      throw new BadRequestException('No Workspace Id');
    }

    const workspace: Workspace = await this.prisma.workspace.findFirst({
      where: { uuid: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('WORKSPACE: NOT FOUND');
    }

    const userRoles = request.user.roles;
    const matchedRole = userRoles.find(
      (userRole) => userRole.workspaceId === workspace.id,
    );

    if (!matchedRole) {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }

    if (!roles.includes(matchedRole.roleType)) {
      throw new ForbiddenException('WORKSPACE: INSUFFICIENT PERMISSIONS');
    }

    request.userRole = matchedRole.roleType;
    request.headers['workspace'] = workspace;

    return true;
  }
}
