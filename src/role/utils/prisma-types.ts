import { Prisma } from '@prisma/client';

export type RoleWithUser = Prisma.RoleGetPayload<typeof roleWithUser>;

export const roleWithUser = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    user: true,
  },
});

export type RoleWithWorkspace = Prisma.RoleGetPayload<typeof roleWithWorkspace>;

export const roleWithWorkspace = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    workspace: true,
  },
});
