/*
  Warnings:

  - You are about to drop the `Chapther` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChaptherImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChaptherTranslated` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Chapther` DROP FOREIGN KEY `Chapther_manga_id_fkey`;

-- DropForeignKey
ALTER TABLE `Chapther` DROP FOREIGN KEY `Chapther_scan_id_fkey`;

-- DropForeignKey
ALTER TABLE `ChaptherImage` DROP FOREIGN KEY `ChaptherImage_chapther_id_fkey`;

-- DropForeignKey
ALTER TABLE `ChaptherTranslated` DROP FOREIGN KEY `ChaptherTranslated_user_id_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `can_comments` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `Chapther`;

-- DropTable
DROP TABLE `ChaptherImage`;

-- DropTable
DROP TABLE `ChaptherTranslated`;

-- CreateTable
CREATE TABLE `Chapter` (
    `id` VARCHAR(191) NOT NULL,
    `manga_id` VARCHAR(191) NOT NULL,
    `volume` VARCHAR(191) NOT NULL DEFAULT '',
    `chapther` DOUBLE NOT NULL DEFAULT 0,
    `flags` VARCHAR(191) NULL,
    `title` VARCHAR(255) NOT NULL DEFAULT '',
    `language` VARCHAR(191) NOT NULL DEFAULT 'EN',
    `pages` INTEGER NOT NULL DEFAULT 0,
    `scan_id` VARCHAR(191) NOT NULL,
    `publishAt` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChapterImage` (
    `id` VARCHAR(191) NOT NULL,
    `chapther_id` VARCHAR(191) NOT NULL,
    `delete_at` DATETIME(3) NOT NULL,
    `base_url` VARCHAR(191) NOT NULL,
    `data_images` JSON NOT NULL,
    `low_images` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChapterTranslated` (
    `id` VARCHAR(191) NOT NULL,
    `chapther_id` VARCHAR(191) NOT NULL,
    `target_language` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `pages` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChapterComments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `chapter_id` VARCHAR(191) NOT NULL,
    `text` LONGTEXT NOT NULL,
    `spoiler` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_blocked_type` ENUM('MODERATOR', 'AI') NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Chapter` ADD CONSTRAINT `Chapter_manga_id_fkey` FOREIGN KEY (`manga_id`) REFERENCES `Manga`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chapter` ADD CONSTRAINT `Chapter_scan_id_fkey` FOREIGN KEY (`scan_id`) REFERENCES `Scan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChapterImage` ADD CONSTRAINT `ChapterImage_chapther_id_fkey` FOREIGN KEY (`chapther_id`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChapterTranslated` ADD CONSTRAINT `ChapterTranslated_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChapterComments` ADD CONSTRAINT `ChapterComments_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChapterComments` ADD CONSTRAINT `ChapterComments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
