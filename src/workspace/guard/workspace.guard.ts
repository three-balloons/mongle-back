import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Workspace } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    if (workspace.userId != request.user.id) {
      throw new UnauthorizedException('WORKSPACE: UNAUTHORIZED USER');
    }

    request.headers['workspace'] = workspace;
    return true;
  }
}
