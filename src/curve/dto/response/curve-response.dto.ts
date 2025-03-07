import { Curve } from '@prisma/client';

export class Config {
  color: string;
  thickness: number;

  constructor(color: string, thickness: number) {
    this.color = color;
    this.thickness = thickness;
  }
}

export class CurveResponse {
  id: number;
  position: string;
  bubbleId: number;
  config: Config;

  constructor(curve: Curve) {
    this.id = curve.id;
    this.position = curve.position;
    this.bubbleId = curve.bubbleId;
    this.config = new Config(curve.color, curve.thickness);
  }
}
