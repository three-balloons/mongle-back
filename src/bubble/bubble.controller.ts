import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BubbleService } from './bubble.service';
import { WorkspaceGuard } from 'src/workspace/guard/workspace.guard';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { ApiBearerAuth, ApiHeader, ApiSecurity } from '@nestjs/swagger';
import { Workspace } from '@prisma/client';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';
import { PostBubbleDto } from './dto/request/post-bubble.dto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';

@Controller('api/bubbles')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@ApiBearerAuth('jwt')
@ApiHeader({
  name: 'workspaceId',
  description: 'workspaceId',
  required: true,
})
export class BubbleController {
  constructor(private readonly bubbleService: BubbleService) {}

  @Post()
  async postBubble(
    @GetWorkspace() workspace: Workspace,
    @Body() postBubbleDto: PostBubbleDto,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.postBubble(workspace, postBubbleDto);
  }

  @Delete('/:bubbleId')
  async deleteBubbleById(
    @GetWorkspace() workspace: Workspace,
    @Param('bubbleId') bubbleId: number,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.deleteBubbleById(workspace, bubbleId);
  }

  @Patch('/:bubbleId/restore')
  async restoreBubbleById(
    @GetWorkspace() workspace: Workspace,
    @Param('bubbleId') bubbleId: number,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.restoreBubbleById(workspace, bubbleId);
  }
}
