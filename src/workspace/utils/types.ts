import { Prisma } from '@prisma/client';

export type WorkspaceWithUser = Prisma.WorkspaceGetPayload<
  typeof workspaceWithUser
>;

export const workspaceWithUser =
  Prisma.validator<Prisma.WorkspaceDefaultArgs>()({
    include: {
      user: true,
    },
  });
