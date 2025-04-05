import { Prisma } from '@prisma/client';

export type RoleWithUsers = Prisma.RoleGetPayload<typeof roleWithUsers>;

export const roleWithUsers = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    user: true,
  },
});
