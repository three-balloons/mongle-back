import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserWithRoles } from 'src/user/utils/prisma-types';

export const GetUser = createParamDecorator<string>(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: User | UserWithRoles = request.user;
    return user;
  },
);
