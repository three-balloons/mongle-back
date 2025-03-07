import { Injectable, NotFoundException } from '@nestjs/common';
import { Workspace } from '@prisma/client';
import { PostCurveDto } from './dto/request/post-curve.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { CurveResponse } from './dto/response/curve-response.dto';
import { PutCurveDto } from './dto/request/put-curve.dto';

@Injectable()
export class CurveService {
  constructor(private readonly prisma: PrismaService) {}

  async postCurve(
    workspace: Workspace,
    postCurveDto: PostCurveDto,
  ): Promise<GlobalResponseDto> {
    const { position, config, bubbleId } = postCurveDto;
    const bubble = this.prisma.bubble.findUnique({
      where: { id: bubbleId, workspaceId: workspace.id },
    });

    if (!bubble) {
      throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
    }

    const curve = await this.prisma.curve.create({
      data: {
        position,
        color: config.color,
        thickness: config.thickness,
        bubble: { connect: { id: bubbleId } },
      },
    });

    return new GlobalResponseDto('OK', '', new CurveResponse(curve));
  }

  async putCurve(
    workspace: Workspace,
    putCurveDto: PutCurveDto,
    curveId: number,
  ): Promise<GlobalResponseDto> {
    const { position, config, bubbleId } = putCurveDto;
    const bubble = this.prisma.bubble.findUnique({
      where: { id: bubbleId, workspaceId: workspace.id },
    });

    if (!bubble) {
      throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
    }

    const updatedCurve = await this.prisma.curve.update({
      where: { id: curveId },
      data: {
        position,
        color: config.color,
        thickness: config.thickness,
        bubble: { connect: { id: bubbleId } },
      },
    });

    return new GlobalResponseDto('OK', '', new CurveResponse(updatedCurve));
  }

  async deleteCurve(workspace: Workspace, curveId: number) {
    const deletedCurve = await this.prisma.curve.update({
      where: { id: curveId },
      data: { deletedAt: new Date() },
    });

    return new GlobalResponseDto('OK', '', { curveId });
  }

  async restoreCurve(workspace: Workspace, curveId: number) {
    const restoredCurve = await this.prisma.curve.update({
      where: { id: curveId },
      data: { deletedAt: null },
    });

    return new GlobalResponseDto('OK', '', { curveId });
  }
}
