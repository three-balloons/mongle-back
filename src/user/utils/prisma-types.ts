import { Prisma } from '@prisma/client';

export type UserWithRoles = Prisma.UserGetPayload<typeof userWithRoles>;

export const userWithRoles = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    roles: true,
  },
});
