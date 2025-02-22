import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor() {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const workspaceId = request.headers['workspaceId'];

    if (!workspaceId) {
      throw new BadRequestException('No Workspace Id');
    }
    return true;
  }
}
