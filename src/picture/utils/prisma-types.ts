import { Prisma } from '@prisma/client';

export type PictureWithBubble = Prisma.PictureGetPayload<
  typeof pictureWithBubble
>;

export const pictureWithBubble = Prisma.validator<Prisma.PictureDefaultArgs>()({
  include: {
    bubble: true,
  },
});
