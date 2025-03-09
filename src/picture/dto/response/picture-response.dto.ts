import { Picture } from '@prisma/client';

export class PictureResponseDto {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
  isFlippedX: boolean;
  isFlippedY: boolean;
  angle: number;
  bubbleId: number;
  fileId: number;

  constructor(picture: Picture) {
    this.id = picture.id;
    this.top = picture.top;
    this.width = picture.width;
    this.height = picture.height;
    this.isFlippedX = picture.isFlippedX;
    this.isFlippedY = picture.isFlippedY;
    this.angle = picture.angle;
    this.bubbleId = picture.bubbleId;
    this.fileId = picture.fileId;
  }
}
