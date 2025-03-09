import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { Readable } from 'stream';
import { PrismaService } from 'src/prisma/prisma.service';
import { PictureWithBubble, pictureWithBubble } from 'src/picture/utils/types';
import { User, Workspace } from '@prisma/client';

@Injectable()
export class FileService {
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

  async uploadTempFile(file: Express.Multer.File): Promise<GlobalResponseDto> {
    if (!file || file.size === 0) {
      throw new BadRequestException('FILE: EMPTY FILE');
    }

    const fileName = this.createFileName(file.originalname);
    const filePath = `temp/${fileName}`;
    const contentType = file.mimetype;
    const sizeInMB = file.size / (1024 * 1024);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: filePath,
          Body: file.buffer,
          ContentType: contentType,
          ACL: 'public-read',
        }),
      );

      const savedFile = await this.prisma.file.create({
        data: {
          path: filePath,
          type: contentType,
          size: sizeInMB,
        },
      });
      return new GlobalResponseDto('OK', '', { fileId: savedFile.id });
    } catch (error) {
      throw new InternalServerErrorException('FILE: FILE UPLOAD FAILED');
    }
  }

  async getFileById(
    user: User,
    workspace: Workspace,
    fileId: number,
  ): Promise<GlobalResponseDto> {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('FILE: FILE NOT FOUND');
    }

    const filePath = file.path;

    if (filePath.startsWith('temp/')) {
      throw new ForbiddenException("FILE: TEMP FILE CAN'T BE ACCESSED");
    }

    if (!filePath.startsWith(`${user.oAuthId}/${workspace.uuid}`)) {
      throw new UnauthorizedException('FILE: UNAUTHORIZED USER');
    }

    try {
      const { Body } = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: filePath,
        }),
      );

      if (!Body) {
        throw new InternalServerErrorException('FILE: FILE DOWNLOAD FAILED');
      }

      const fileBuffer = await this.streamToBuffer(Body as Readable);
      return new GlobalResponseDto('OK', '', { data: fileBuffer });
    } catch (error) {
      throw new InternalServerErrorException('FILE: FILE DOWNLOAD FAILED');
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  private createFileName(originalName: string): string {
    const extension = originalName.split('.').pop();
    return `${randomUUID()}.${extension}`;
  }
}
