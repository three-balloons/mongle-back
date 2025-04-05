import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CurveService } from './curve.service';
import { PostCurveDto } from './dto/request/post-curve.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt.guard';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { GetWorkspace } from 'src/utils/decorator/get-workspace.decorator';
import { RoleType, Workspace } from '@prisma/client';
import { GlobalResponseDto } from 'src/utils/dto/response.dto';
import { PutCurveDto } from './dto/request/put-curve.dto';
import { RoleGuard } from 'src/user/guard/role.guard';
import { Roles } from 'src/utils/decorator/role.decorator';

@Controller('/api/curves')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('jwt')
@ApiHeader({
  name: 'workspaceId',
  description: 'workspaceId',
  required: true,
})
export class CurveController {
  constructor(private readonly curveService: CurveService) {}

  @Post()
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async postCurve(
    @GetWorkspace() workspace: Workspace,
    @Body() postCurveDto: PostCurveDto,
  ): Promise<GlobalResponseDto> {
    return this.curveService.postCurve(workspace, postCurveDto);
  }

  @Put('/:curveId')
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async putCurve(
    @GetWorkspace() workspace: Workspace,
    @Body() putCurveDto: PutCurveDto,
    @Param('curveId') curveId: number,
  ): Promise<GlobalResponseDto> {
    return this.curveService.putCurve(workspace, putCurveDto, curveId);
  }

  @Delete('/:curveId')
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async deleteCurve(
    @GetWorkspace() workspace: Workspace,
    @Param('curveId') curveId: number,
  ): Promise<GlobalResponseDto> {
    return this.curveService.deleteCurve(workspace, curveId);
  }

  @Patch('/:curveId/restore')
  @Roles(RoleType.OWNER, RoleType.EDITOR)
  async restoreCurve(
    @GetWorkspace() workspace: Workspace,
    @Param('curveId') curveId: number,
  ): Promise<GlobalResponseDto> {
    return this.curveService.restoreCurve(workspace, curveId);
  }
}
