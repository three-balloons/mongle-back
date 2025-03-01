import { Prisma } from '@prisma/client';

// Type For Prisma Include
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

// Type For Formatting Response
export type BubbleWithShapes = Omit<
  BubbleWithCurvesAndPictures,
  'curves' | 'pictures'
> & {
  shapes: Shape[];
};

export type Shape = {
  id: number;
  updatedAt: Date;
} & (
  | { type: string; position: string; config: CurveConfig }
  | {
      type: string;
      angle: number;
      top: number;
      left: number;
      width: number;
      height: number;
      isFlippedX: boolean;
      isFlippedY: boolean;
      fileId: number;
    }
);

type CurveConfig = {
  color: string;
  thickness: number;
};
