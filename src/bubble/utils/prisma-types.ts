import { Prisma } from '@prisma/client';

export type BubbleWithCurvesAndPictures = Prisma.BubbleGetPayload<
  typeof bubbleWithCurvesAndPictures
>;

export const bubbleWithCurvesAndPictures =
  Prisma.validator<Prisma.BubbleDefaultArgs>()({
    include: {
      curves: true,
      pictures: true,
    },
  });
