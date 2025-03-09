import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
} from '@nestjs/swagger';
import { PostImageDto } from './dto/request/post-image.dto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { WorkspaceGuard } from 'src/workspace/guard/workspace.guard';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';
import { User, Workspace } from '@prisma/client';
import { GetUser } from 'src/utils/decorator/get-user.decorator';

@Controller('/api/files/')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('/temporary')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '업로드할 파일',
    type: PostImageDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GlobalResponseDto> {
    return await this.fileService.uploadTempFile(file);
  }

  @Get('/:fileId')
  @UseGuards(WorkspaceGuard)
  @ApiHeader({
    name: 'workspaceId',
    description: 'workspaceId',
    required: true,
  })
  async getFileById(
    @GetUser() user: User,
    @GetWorkspace() workspace: Workspace,
    @Query('fileId') fileId: number,
  ): Promise<GlobalResponseDto> {
    return await this.fileService.getFileById(user, workspace, fileId);
  }
}
