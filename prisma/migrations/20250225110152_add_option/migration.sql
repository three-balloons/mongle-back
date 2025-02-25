-- DropForeignKey
ALTER TABLE `Bubble` DROP FOREIGN KEY `Bubble_workspaceId_fkey`;

-- DropForeignKey
ALTER TABLE `Curve` DROP FOREIGN KEY `Curve_bubbleId_fkey`;

-- DropForeignKey
ALTER TABLE `Picture` DROP FOREIGN KEY `Picture_bubbleId_fkey`;

-- DropForeignKey
ALTER TABLE `Picture` DROP FOREIGN KEY `Picture_fileId_fkey`;

-- DropForeignKey
ALTER TABLE `Workspace` DROP FOREIGN KEY `Workspace_userId_fkey`;

-- DropIndex
DROP INDEX `Bubble_workspaceId_fkey` ON `Bubble`;

-- DropIndex
DROP INDEX `Curve_bubbleId_fkey` ON `Curve`;

-- DropIndex
DROP INDEX `Picture_bubbleId_fkey` ON `Picture`;

-- DropIndex
DROP INDEX `Workspace_userId_fkey` ON `Workspace`;

-- AddForeignKey
ALTER TABLE `Bubble` ADD CONSTRAINT `Bubble_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Curve` ADD CONSTRAINT `Curve_bubbleId_fkey` FOREIGN KEY (`bubbleId`) REFERENCES `Bubble`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Picture` ADD CONSTRAINT `Picture_bubbleId_fkey` FOREIGN KEY (`bubbleId`) REFERENCES `Bubble`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Picture` ADD CONSTRAINT `Picture_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
