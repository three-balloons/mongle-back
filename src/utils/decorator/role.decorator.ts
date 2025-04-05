import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@prisma/client';

export const Roles = (...roles: RoleType[]): any => SetMetadata('roles', roles);
