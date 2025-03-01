import { Bubble } from '@prisma/client';
import { BubbleWithShapes, Shape } from 'src/bubble/utils/types';

export class BubbleResponseDto
  implements
    Omit<
      BubbleWithShapes,
      'createdAt' | 'updatedAt' | 'deletedAt' | 'pathDepth' | 'workspaceId'
    >
{
  id: number;
  path: string;
  name: string;
  top: number;
  left: number;
  width: number;
  height: number;
  shapes: Shape[];

  constructor(bubble: Bubble, shapes: Shape[]) {
    this.id = bubble.id;
    this.path = bubble.path;
    this.name = bubble.name;
    this.top = bubble.top;
    this.left = bubble.left;
    this.width = bubble.width;
    this.height = bubble.height;
    this.shapes = shapes.map((shape) => ({ ...shape }));
  }
}
