import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BubbleService } from './bubble.service';
import { CreateBubbleDto } from './dto/create-bubble.dto';
import { UpdateBubbleDto } from './dto/update-bubble.dto';
import { WorkspaceGuard } from 'src/workspace/guard/workspace.guard';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { ApiBearerAuth, ApiHeader, ApiSecurity } from '@nestjs/swagger';
import { Workspace } from '@prisma/client';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';

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
  create(@Body() createBubbleDto: CreateBubbleDto) {
    return this.bubbleService.create(createBubbleDto);
  }

  @Get()
  findAll(@GetWorkspace() workspace: Workspace) {
    return this.bubbleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bubbleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBubbleDto: UpdateBubbleDto) {
    return this.bubbleService.update(+id, updateBubbleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bubbleService.remove(+id);
  }
}
