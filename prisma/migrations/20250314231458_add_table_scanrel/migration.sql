/*
  Warnings:

  - You are about to drop the column `scan_id` on the `Chapter` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Chapter` DROP FOREIGN KEY `Chapter_scan_id_fkey`;

-- DropIndex
DROP INDEX `Chapter_scan_id_fkey` ON `Chapter`;

-- AlterTable
ALTER TABLE `Chapter` DROP COLUMN `scan_id`;

-- CreateTable
CREATE TABLE `ChapterScan` (
    `chapter_id` VARCHAR(191) NOT NULL,
    `scan_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`chapter_id`, `scan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChapterScan` ADD CONSTRAINT `ChapterScan_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChapterScan` ADD CONSTRAINT `ChapterScan_scan_id_fkey` FOREIGN KEY (`scan_id`) REFERENCES `Scan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
