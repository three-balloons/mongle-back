import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bubble, Workspace } from '@prisma/client';
import { PostBubbleDto } from './dto/request/post-bubble.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { Shape } from './utils/types';
import { BubbleResponseDto } from './dto/response/bubble-response.dto';
import { PutBubbleDto } from './dto/request/put-bubble.dto';
import {
  bubbleWithCurvesAndPictures,
  BubbleWithCurvesAndPictures,
} from './utils/prisma-types';

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

      const bubblePathsCondition = {
        OR: [
          { path: bubble.path },
          { path: { startsWith: bubble.path + '/' } },
        ],
      };

      await prisma.bubble.updateMany({
        where: bubblePathsCondition,
        data: { deletedAt: new Date() },
      });

      await prisma.picture.updateMany({
        where: { bubble: bubblePathsCondition },
        data: { deletedAt: new Date() },
      });

      await prisma.curve.updateMany({
        where: { bubble: bubblePathsCondition },
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

      const bubblePathsCondition = {
        OR: [
          { path: bubble.path },
          { path: { startsWith: bubble.path + '/' } },
        ],
      };

      await prisma.bubble.updateMany({
        where: bubblePathsCondition,
        data: { deletedAt: null },
      });

      await prisma.picture.updateMany({
        where: { bubble: bubblePathsCondition },
        data: { deletedAt: null },
      });

      await prisma.curve.updateMany({
        where: { bubble: bubblePathsCondition },
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
      deletedAt: null,
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
          ...curves
            .filter((curve) => curve.deletedAt === null)
            .map((curve) => ({
              id: curve.id,
              updatedAt: curve.updatedAt,
              type: 'Curve',
              position: curve.position,
              config: {
                color: curve.color,
                thickness: curve.thickness,
              },
            })),
          ...pictures
            .filter((picture) => picture.deletedAt === null)
            .map((picture) => ({
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
      where: { workspaceId: workspace.id, id: bubbleId, deletedAt: null },
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
          ...curves
            .filter((curve) => curve.deletedAt === null)
            .map((curve) => ({
              id: curve.id,
              updatedAt: curve.updatedAt,
              type: 'Curve',
              position: curve.position,
              config: {
                color: curve.color,
                thickness: curve.thickness,
              },
            })),
          ...pictures
            .filter((picture) => picture.deletedAt === null)
            .map((picture) => ({
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

  async putBubbleById(
    workspace: Workspace,
    bubbleId: number,
    putBubbleDto: PutBubbleDto,
  ): Promise<GlobalResponseDto> {
    return this.prisma.$transaction(async (prisma) => {
      const bubble: Bubble = await prisma.bubble.findUnique({
        where: { workspaceId: workspace.id, id: bubbleId, deletedAt: null },
      });

      if (!bubble) {
        throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
      }

      const { newPath, name, top, left, width, height } = putBubbleDto;

      if (!(newPath === undefined || newPath === null || newPath === '')) {
        const tempBubble: Bubble = await prisma.bubble.findFirst({
          where: { workspaceId: workspace.id, path: newPath, deletedAt: null },
        });

        if (tempBubble) {
          throw new BadRequestException('BUBBLE: ALREADY EXISTS');
        }

        const parentPath: string = newPath.substring(
          0,
          newPath.lastIndexOf('/'),
        );

        let parentBubble: Bubble;
        if (parentPath !== '') {
          parentBubble = await prisma.bubble.findFirst({
            where: {
              workspaceId: workspace.id,
              path: parentPath,
              deletedAt: null,
            },
          });

          if (!parentBubble) {
            throw new NotFoundException('BUBBLE: PARENT NOT FOUND');
          }
        }

        const affectedBubbles: Bubble[] = await prisma.bubble.findMany({
          where: {
            workspaceId: workspace.id,
            OR: [
              { path: bubble.path },
              { path: { startsWith: bubble.path + '/' } },
            ],
          },
        });

        await Promise.all(
          affectedBubbles.map(async (b) => {
            const newBubblePath =
              newPath + b.path.substring(bubble.path.length);
            const newPathDepth = newBubblePath.split('/').length - 1;

            await prisma.bubble.update({
              where: { id: b.id },
              data: { path: newBubblePath, pathDepth: newPathDepth },
            });
          }),
        );
      }

      const updatedBubble = await prisma.bubble.update({
        where: { id: bubble.id },
        data: { name, top, left, width, height },
        ...bubbleWithCurvesAndPictures,
      });

      const { curves, pictures, ...bubbleData } = updatedBubble;

      const shapes: Shape[] = [
        ...curves
          .filter((curve) => curve.deletedAt === null)
          .map((curve) => ({
            id: curve.id,
            updatedAt: curve.updatedAt,
            type: 'Curve',
            position: curve.position,
            config: {
              color: curve.color,
              thickness: curve.thickness,
            },
          })),
        ...pictures
          .filter((picture) => picture.deletedAt === null)
          .map((picture) => ({
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

      await prisma.workspace.update({
        where: { uuid: workspace.uuid },
        data: { updatedAt: new Date() },
      });

      return new GlobalResponseDto(
        'OK',
        '',
        new BubbleResponseDto(bubbleData, shapes),
      );
    });
  }
}
