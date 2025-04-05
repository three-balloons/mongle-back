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
  Put,
} from '@nestjs/common';
import { BubbleService } from './bubble.service';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { RoleType, Workspace } from '@prisma/client';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';
import { PostBubbleDto } from './dto/request/post-bubble.dto';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { PutBubbleDto } from './dto/request/put-bubble.dto';
import { RoleGuard } from 'src/user/guard/role.guard';
import { Roles } from 'src/utils/decorator/role.decorator';

@Controller('api/bubbles')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('jwt')
@ApiHeader({
  name: 'workspaceId',
  description: 'workspaceId',
  required: true,
})
export class BubbleController {
  constructor(private readonly bubbleService: BubbleService) {}

  @Post()
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async postBubble(
    @GetWorkspace() workspace: Workspace,
    @Body() postBubbleDto: PostBubbleDto,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.postBubble(workspace, postBubbleDto);
  }

  @Delete('/:bubbleId')
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async deleteBubbleById(
    @GetWorkspace() workspace: Workspace,
    @Param('bubbleId') bubbleId: number,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.deleteBubbleById(workspace, bubbleId);
  }

  @Patch('/:bubbleId/restore')
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async restoreBubbleById(
    @GetWorkspace() workspace: Workspace,
    @Param('bubbleId') bubbleId: number,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.restoreBubbleById(workspace, bubbleId);
  }

  @Get()
  @Roles(RoleType.VIEWER, RoleType.EDITOR, RoleType.OWNER)
  @ApiQuery({ name: 'pathDepth', required: false })
  async getBubbles(
    @GetWorkspace() workspace: Workspace,
    @Query('pathDepth') pathDepth?: number,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.getBubbles(
      workspace,
      pathDepth !== undefined ? pathDepth : undefined,
    );
  }

  @Get('/:bubbleId')
  @Roles(RoleType.VIEWER, RoleType.EDITOR, RoleType.OWNER)
  @ApiQuery({ name: 'pathDepth', required: false })
  async getBubbleById(
    @GetWorkspace() workspace: Workspace,
    @Param('bubbleId') bubbleId: number,
    @Query('pathDepth') pathDepth?: number,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.getBubbleById(
      workspace,
      bubbleId,
      pathDepth !== undefined ? pathDepth : undefined,
    );
  }

  @Put('/:bubbleId')
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async putBubbleById(
    @GetWorkspace() workspace: Workspace,
    @Param('bubbleId') bubbleId: number,
    @Body() putBubbleDto: PutBubbleDto,
  ): Promise<GlobalResponseDto> {
    return await this.bubbleService.putBubbleById(
      workspace,
      bubbleId,
      putBubbleDto,
    );
  }
}
