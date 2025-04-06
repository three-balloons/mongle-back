import { RoleType, Workspace } from '@prisma/client';
import { WorkspaceWithRoles } from 'src/workspace/utils/prisma-types';

export class WorkspaceResponseDto {
  constructor(workspace: Workspace | WorkspaceWithRoles, roleType: RoleType) {
    this.id = workspace.uuid;
    this.name = workspace.name;
    this.theme = workspace.theme;
    this.createdAt = workspace.createdAt;
    this.updatedAt = workspace.updatedAt;
    this.deletedAt = workspace.deletedAt;
    this.roleType = roleType;
  }

  id: string;
  name: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: number;
  roleType: RoleType;
}
