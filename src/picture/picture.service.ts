import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostPictureDto } from './dto/request/post-picture.dto';
import { Picture, User, Workspace } from '@prisma/client';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { PictureResponseDto } from './dto/response/picture-response.dto';
import { PictureWithBubble, pictureWithBubble } from './utils/prisma-types';

@Injectable()
export class PictureService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('IAM_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('IAM_SECRET_KEY'),
      },
    });
    this.bucket = this.configService.get<string>('BUCKET_NAME');
  }

  async postPicture(
    user: User,
    workspace: Workspace,
    postPictureDto: PostPictureDto,
  ) {
    const {
      top,
      left,
      width,
      height,
      isFlippedX,
      isFlippedY,
      angle,
      bubbleId,
      fileId,
    } = postPictureDto;

    const file = await this.prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      throw new NotFoundException('FILE: FILE NOT FOUND');
    }

    const bubble = await this.prisma.bubble.findUnique({
      where: { workspaceId: workspace.id, id: bubbleId, deletedAt: null },
    });

    if (!bubble) {
      throw new NotFoundException('BUBBLE: BUBBLE NOT FOUND');
    }

    const filePath = file.path;

    if (!filePath.startsWith('temp/')) {
      throw new BadRequestException('FILE: INAPPROPRIATE FILE PATH');
    }

    const targetPath = filePath.replace(
      'temp/',
      `${user.oAuthId}/${workspace.uuid}/pictures/`,
    );

    try {
      await this.s3Client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${filePath}`,
          Key: targetPath,
        }),
      );

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: filePath,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('FILE: FILE MOVE FAILED');
    }

    const picture = await this.prisma.$transaction(async (tx) => {
      await tx.file.update({
        where: { id: fileId },
        data: { path: targetPath },
      });

      const createdPicture = await tx.picture.create({
        data: {
          top,
          left,
          width,
          height,
          isFlippedX,
          isFlippedY,
          angle,
          bubble: { connect: { id: bubbleId } },
          file: { connect: { id: fileId } },
        },
      });

      await tx.bubble.update({
        where: { id: bubbleId },
        data: {
          updatedAt: new Date(),
          workspace: { update: { updatedAt: new Date() } },
        },
      });

      return createdPicture;
    });
    return new GlobalResponseDto('OK', '', new PictureResponseDto(picture));
  }

  async getPictureById(pictureId: number): Promise<GlobalResponseDto> {
    const picture: Picture = await this.prisma.picture.findUnique({
      where: {
        id: pictureId,
      },
    });
    return new GlobalResponseDto('OK', '', new PictureResponseDto(picture));
  }

  async deletePictureById(workspace: Workspace, pictureId: number) {
    const picture = await this.prisma.$transaction(async (tx) => {
      const picture: PictureWithBubble = await tx.picture.findUnique({
        where: { id: pictureId },
        ...pictureWithBubble,
      });

      if (!picture || picture.bubble.workspaceId !== workspace.id) {
        throw new NotFoundException('PICTURE: PICTURE NOT FOUND');
      }

      const deletedPicture = await tx.picture.update({
        where: { id: pictureId },
        data: { deletedAt: new Date() },
      });

      await tx.bubble.update({
        where: { id: picture.bubble.id },
        data: {
          updatedAt: new Date(),
          workspace: { update: { updatedAt: new Date() } },
        },
      });

      return deletedPicture;
    });

    return new GlobalResponseDto('OK', '', { pictureId: picture.id });
  }

  async restorePictureById(workspace: Workspace, pictureId: number) {
    const picture = await this.prisma.$transaction(async (tx) => {
      const picture: PictureWithBubble = await tx.picture.findUnique({
        where: { id: pictureId },
        ...pictureWithBubble,
      });

      if (!picture || picture.bubble.workspaceId !== workspace.id) {
        throw new NotFoundException('PICTURE: PICTURE NOT FOUND');
      }

      const restoredPicture = await tx.picture.update({
        where: { id: pictureId },
        data: { deletedAt: null },
      });

      await tx.bubble.update({
        where: { id: picture.bubble.id },
        data: {
          updatedAt: new Date(),
          workspace: { update: { updatedAt: new Date() } },
        },
      });

      return restoredPicture;
    });

    return new GlobalResponseDto('OK', '', { pictureId: picture.id });
  }
}
