import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Workspace } from '@prisma/client';

export const GetWorkspace = createParamDecorator<string>(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const workspace: Workspace = request.headers['workspace'];

    return workspace;
  },
);
