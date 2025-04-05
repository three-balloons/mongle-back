import { Prisma } from '@prisma/client';

export type WorkspaceWithRoles = Prisma.WorkspaceGetPayload<
  typeof workspaceWithRoles
>;

export const workspaceWithRoles =
  Prisma.validator<Prisma.WorkspaceDefaultArgs>()({
    include: {
      roles: true,
    },
  });
