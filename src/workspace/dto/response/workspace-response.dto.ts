import { Workspace } from '@prisma/client';

export class WorkspaceResponseDto {
  constructor(workspace: Workspace) {
    this.id = workspace.uuid;
    this.name = workspace.name;
    this.theme = workspace.theme;
    this.createdAt = workspace.createdAt;
    this.updatedAt = workspace.updatedAt;
    this.deletedAt = workspace.deletedAt;
    this.userId = workspace.userId;
  }

  id: string;
  name: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: number;
}
