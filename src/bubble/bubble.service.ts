import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bubble, Workspace } from '@prisma/client';
import { PostBubbleDto } from './dto/request/post-bubble.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import {
  BubbleWithCurvesAndPictures,
  bubbleWithCurvesAndPictures,
  Shape,
} from './utils/types';
import { BubbleResponseDto } from './dto/response/bubble-response.dto';

@Injectable()
export class BubbleService {
  constructor(private readonly prisma: PrismaService) {}

  async postBubble(
    workspace: Workspace,
    postBubbleDto: PostBubbleDto,
  ): Promise<GlobalResponseDto> {
    return this.prisma.$transaction(async (prisma) => {
      const bubble: Bubble = await prisma.bubble.findFirst({
        where: { workspaceId: workspace.id, path: postBubbleDto.path },
      });

      if (bubble) {
        throw new BadRequestException('BUBBLE: ALREADY EXISTS');
      }

      const parentPath: string = postBubbleDto.path.substring(
        0,
        postBubbleDto.path.lastIndexOf('/'),
      );

      const { path, name, top, left, width, height } = postBubbleDto;
      let newBubble: Bubble;

      if (parentPath === '') {
        newBubble = await prisma.bubble.create({
          data: {
            path,
            name,
            top,
            left,
            width,
            height,
            pathDepth: 1,
            workspace: { connect: { id: workspace.id } },
          },
        });
      } else {
        const parentBubble: Bubble = await prisma.bubble.findFirst({
          where: { workspaceId: workspace.id, path: parentPath },
        });

        if (!parentBubble) {
          throw new NotFoundException('BUBBLE: PARENT NOT FOUND');
        }

        newBubble = await prisma.bubble.create({
          data: {
            path,
            name,
            top,
            left,
            width,
            height,
            pathDepth: parentBubble.pathDepth + 1,
            workspace: { connect: { id: workspace.id } },
          },
        });
      }

      await prisma.workspace.update({
        where: { uuid: workspace.uuid },
        data: { updatedAt: new Date() },
      });

      return new GlobalResponseDto(
        'OK',
        '',
        new BubbleResponseDto(newBubble, []),
      );
    });
  }

  async deleteBubbleById(
    workspace: Workspace,
    bubbleId: number,
  ): Promise<GlobalResponseDto> {
    return this.prisma.$transaction(async (prisma) => {
      const bubble = await prisma.bubble.findUnique({
        where: { id: bubbleId, workspaceId: workspace.id },
      });

      if (!bubble) {
        throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
      }

      await prisma.bubble.update({
        where: { id: bubbleId },
        data: {
          deletedAt: new Date(),
          pictures: {
            updateMany: {
              where: {},
              data: { deletedAt: new Date() },
            },
          },
          curves: {
            updateMany: {
              where: {},
              data: { deletedAt: new Date() },
            },
          },
        },
      });

      await prisma.file.updateMany({
        where: {
          picture: {
            bubbleId,
          },
        },
        data: { deletedAt: new Date() },
      });

      await prisma.workspace.update({
        where: { uuid: workspace.uuid },
        data: { updatedAt: new Date() },
      });

      return new GlobalResponseDto('OK', '', { id: bubbleId });
    });
  }

  async restoreBubbleById(
    workspace: Workspace,
    bubbleId: number,
  ): Promise<GlobalResponseDto> {
    return this.prisma.$transaction(async (prisma) => {
      const bubble = await prisma.bubble.findUnique({
        where: { id: bubbleId, workspaceId: workspace.id },
      });

      if (!bubble) {
        throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
      }

      await prisma.bubble.update({
        where: { id: bubbleId },
        data: {
          deletedAt: null,
          pictures: {
            updateMany: {
              where: {},
              data: { deletedAt: null },
            },
          },
          curves: {
            updateMany: {
              where: {},
              data: { deletedAt: null },
            },
          },
        },
      });

      await prisma.file.updateMany({
        where: {
          picture: {
            bubbleId,
          },
        },
        data: { deletedAt: null },
      });

      await prisma.workspace.update({
        where: { uuid: workspace.uuid },
        data: { updatedAt: new Date() },
      });

      return new GlobalResponseDto('OK', '', { id: bubbleId });
    });
  }

  async getBubbles(
    workspace: Workspace,
    pathDepth?: number,
  ): Promise<GlobalResponseDto> {
    const whereCondition: any = {
      workspaceId: workspace.id,
    };

    if (pathDepth !== undefined) {
      if (pathDepth < 1 || pathDepth > 5) {
        throw new BadRequestException('BUBBLE: WRONG PATH DEPTH');
      }
      whereCondition.pathDepth = { lt: pathDepth };
    }

    const bubbles: BubbleWithCurvesAndPictures[] =
      await this.prisma.bubble.findMany({
        where: whereCondition,
        orderBy: { pathDepth: 'asc' },
        ...bubbleWithCurvesAndPictures,
      });

    const transformedBubbles = bubbles.map(
      ({ curves, pictures, ...bubble }) => {
        const shapes: Shape[] = [
          ...curves.map((curve) => ({
            id: curve.id,
            updatedAt: curve.updatedAt,
            type: 'Curve',
            position: curve.position,
            config: {
              color: curve.color,
              thickness: curve.thickness,
            },
          })),
          ...pictures.map((picture) => ({
            id: picture.id,
            updatedAt: picture.updatedAt,
            type: 'Picture',
            angle: picture.angle,
            top: picture.top,
            left: picture.left,
            width: picture.width,
            height: picture.height,
            isFlippedX: picture.isFlippedX,
            isFlippedY: picture.isFlippedY,
            fileId: picture.fileId,
          })),
        ].sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

        return new BubbleResponseDto(bubble, shapes);
      },
    );

    return new GlobalResponseDto('OK', '', transformedBubbles);
  }

  async getBubbleById(
    workspace: Workspace,
    bubbleId: number,
    pathDepth?: number,
  ) {
    const bubble: Bubble = await this.prisma.bubble.findUnique({
      where: { workspaceId: workspace.id, id: bubbleId },
    });

    if (!bubble) {
      throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
    }

    const whereCondition: any = {
      workspaceId: workspace.id,
      OR: [{ path: bubble.path }, { path: { startsWith: bubble.path + '/' } }],
    };

    if (pathDepth !== undefined) {
      if (pathDepth < 1 || pathDepth > 5) {
        throw new BadRequestException('BUBBLE: WRONG PATH DEPTH');
      }
      whereCondition.pathDepth = { lt: bubble.pathDepth + pathDepth };
    }

    const bubbles: BubbleWithCurvesAndPictures[] =
      await this.prisma.bubble.findMany({
        where: whereCondition,
        orderBy: { pathDepth: 'asc' },
        ...bubbleWithCurvesAndPictures,
      });

    const transformedBubbles = bubbles.map(
      ({ curves, pictures, ...bubble }) => {
        const shapes: Shape[] = [
          ...curves.map((curve) => ({
            id: curve.id,
            updatedAt: curve.updatedAt,
            type: 'Curve',
            position: curve.position,
            config: {
              color: curve.color,
              thickness: curve.thickness,
            },
          })),
          ...pictures.map((picture) => ({
            id: picture.id,
            updatedAt: picture.updatedAt,
            type: 'Picture',
            angle: picture.angle,
            top: picture.top,
            left: picture.left,
            width: picture.width,
            height: picture.height,
            isFlippedX: picture.isFlippedX,
            isFlippedY: picture.isFlippedY,
            fileId: picture.fileId,
          })),
        ].sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

        return new BubbleResponseDto(bubble, shapes);
      },
    );

    return new GlobalResponseDto('OK', '', transformedBubbles);
  }
}
