import { Prisma } from '@prisma/client';

export type CurveWithBubble = Prisma.CurveGetPayload<typeof curveWithBubble>;

export const curveWithBubble = Prisma.validator<Prisma.CurveDefaultArgs>()({
  include: {
    bubble: true,
  },
});
