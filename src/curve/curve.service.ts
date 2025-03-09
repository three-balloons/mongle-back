import { Injectable, NotFoundException } from '@nestjs/common';
import { Workspace } from '@prisma/client';
import { PostCurveDto } from './dto/request/post-curve.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { CurveResponse } from './dto/response/curve-response.dto';
import { PutCurveDto } from './dto/request/put-curve.dto';
import { curveWithBubble, CurveWithBubble } from './utils/prisma-types';

@Injectable()
export class CurveService {
  constructor(private readonly prisma: PrismaService) {}

  async postCurve(
    workspace: Workspace,
    postCurveDto: PostCurveDto,
  ): Promise<GlobalResponseDto> {
    const { position, config, bubbleId } = postCurveDto;

    const result = await this.prisma.$transaction(async (tx) => {
      const bubble = await tx.bubble.findUnique({
        where: { id: bubbleId, workspaceId: workspace.id, deletedAt: null },
      });

      if (!bubble) {
        throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
      }

      const curve = await tx.curve.create({
        data: {
          position,
          color: config.color,
          thickness: config.thickness,
          bubble: { connect: { id: bubbleId } },
        },
      });

      await tx.bubble.update({
        where: { id: bubbleId },
        data: {
          updatedAt: new Date(),
          workspace: { update: { updatedAt: new Date() } },
        },
      });

      return curve;
    });

    return new GlobalResponseDto('OK', '', new CurveResponse(result));
  }

  async putCurve(
    workspace: Workspace,
    putCurveDto: PutCurveDto,
    curveId: number,
  ): Promise<GlobalResponseDto> {
    const { position, config, bubbleId } = putCurveDto;

    const result = await this.prisma.$transaction(async (tx) => {
      const bubble = await tx.bubble.findUnique({
        where: { id: bubbleId, workspaceId: workspace.id, deletedAt: null },
      });

      if (!bubble) {
        throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
      }

      const updatedCurve = await tx.curve.update({
        where: { id: curveId },
        data: {
          position,
          color: config.color,
          thickness: config.thickness,
          bubble: { connect: { id: bubbleId } },
        },
      });

      await tx.bubble.update({
        where: { id: bubbleId },
        data: {
          updatedAt: new Date(),
          workspace: { update: { updatedAt: new Date() } },
        },
      });

      return updatedCurve;
    });

    return new GlobalResponseDto('OK', '', new CurveResponse(result));
  }
  async deleteCurve(workspace: Workspace, curveId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const curve: CurveWithBubble = await tx.curve.findUnique({
        where: { id: curveId },
        ...curveWithBubble,
      });

      if (!curve || curve.bubble.workspaceId !== workspace.id) {
        throw new NotFoundException('CURVE: CURVE NOT FOUND');
      }

      const deletedCurve = await tx.curve.update({
        where: { id: curveId },
        data: { deletedAt: new Date() },
      });

      await tx.bubble.update({
        where: { id: curve.bubble.id },
        data: {
          updatedAt: new Date(),
          workspace: { update: { updatedAt: new Date() } },
        },
      });

      return deletedCurve;
    });

    return new GlobalResponseDto('OK', '', { curveId: result.id });
  }

  async restoreCurve(workspace: Workspace, curveId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const curve: CurveWithBubble = await tx.curve.findUnique({
        where: { id: curveId },
        ...curveWithBubble,
      });

      if (!curve || curve.bubble.workspaceId !== workspace.id) {
        throw new NotFoundException('CURVE: CURVE NOT FOUND');
      }

      const restoredCurve = await tx.curve.update({
        where: { id: curveId },
        data: { deletedAt: null },
      });

      await tx.bubble.update({
        where: { id: curve.bubble.id },
        data: {
          updatedAt: new Date(),
          workspace: { update: { updatedAt: new Date() } },
        },
      });

      return restoredCurve;
    });

    return new GlobalResponseDto('OK', '', { curveId: result.id });
  }
}
