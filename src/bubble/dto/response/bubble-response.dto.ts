import { Bubble, Curve } from '@prisma/client';

export class BubbleResponseDto {
  constructor(bubble: Bubble, shapes: Curve[]) {
    this.id = bubble.id;
    this.path = bubble.path;
    this.name = bubble.name;
    this.top = bubble.top;
    this.left = bubble.left;
    this.width = bubble.width;
    this.height = bubble.height;
    this.shapes = shapes;
  }

  id: number;
  path: string;
  name: string;
  top: number;
  left: number;
  width: number;
  height: number;
  shapes: Curve[];
}
