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
import { CurveService } from './curve.service';
import { PostCurveDto } from './dto/request/post-curve.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { WorkspaceGuard } from 'src/workspace/guard/workspace.guard';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';
import { Workspace } from '@prisma/client';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { PutCurveDto } from './dto/request/put-curve.dto';

@Controller('/api/curves')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@ApiBearerAuth('jwt')
@ApiHeader({
  name: 'workspaceId',
  description: 'workspaceId',
  required: true,
})
export class CurveController {
  constructor(private readonly curveService: CurveService) {}

  @Post()
  async postCurve(
    @GetWorkspace() workspace: Workspace,
    @Body() postCurveDto: PostCurveDto,
  ): Promise<GlobalResponseDto> {
    return this.curveService.postCurve(workspace, postCurveDto);
  }

  @Put('/:curveId')
  async putCurve(
    @GetWorkspace() workspace: Workspace,
    @Body() putCurveDto: PutCurveDto,
    @Query('curveId') curveId: number,
  ): Promise<GlobalResponseDto> {
    return this.curveService.putCurve(workspace, putCurveDto, curveId);
  }

  @Delete('/:curveId')
  async deleteCurve(
    @GetWorkspace() workspace: Workspace,
    @Query('curveId') curveId: number,
  ): Promise<GlobalResponseDto> {
    return this.curveService.deleteCurve(workspace, curveId);
  }

  @Patch('/:curveId/restore')
  async restoreCurve(
    @GetWorkspace() workspace: Workspace,
    @Query('curveId') curveId: number,
  ): Promise<GlobalResponseDto> {
    return this.curveService.restoreCurve(workspace, curveId);
  }
}
