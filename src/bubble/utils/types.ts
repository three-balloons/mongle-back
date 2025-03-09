import { BubbleWithCurvesAndPictures } from './prisma-types';

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
