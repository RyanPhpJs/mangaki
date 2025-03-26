/*
  Warnings:

  - The primary key for the `MangaRelation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `biography` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `booth` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `fanBox` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `fantia` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `melonBook` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `namicomi` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `naver` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `nicoVideo` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `pixiv` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `skeb` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `tumblr` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `weibo` on the `MangaRelation` table. All the data in the column will be lost.
  - You are about to drop the column `youtube` on the `MangaRelation` table. All the data in the column will be lost.
  - Added the required column `member_id` to the `MangaRelation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MangaRelation` DROP PRIMARY KEY,
    DROP COLUMN `biography`,
    DROP COLUMN `booth`,
    DROP COLUMN `fanBox`,
    DROP COLUMN `fantia`,
    DROP COLUMN `id`,
    DROP COLUMN `imageUrl`,
    DROP COLUMN `melonBook`,
    DROP COLUMN `name`,
    DROP COLUMN `namicomi`,
    DROP COLUMN `naver`,
    DROP COLUMN `nicoVideo`,
    DROP COLUMN `pixiv`,
    DROP COLUMN `skeb`,
    DROP COLUMN `tumblr`,
    DROP COLUMN `twitter`,
    DROP COLUMN `type`,
    DROP COLUMN `website`,
    DROP COLUMN `weibo`,
    DROP COLUMN `youtube`,
    ADD COLUMN `member_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`member_id`, `manga_id`);

-- CreateTable
CREATE TABLE `MangaMember` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('artist', 'author') NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `biography` JSON NOT NULL,
    `twitter` VARCHAR(191) NULL,
    `pixiv` VARCHAR(191) NULL,
    `melonBook` VARCHAR(191) NULL,
    `fanBox` VARCHAR(191) NULL,
    `booth` VARCHAR(191) NULL,
    `nicoVideo` VARCHAR(191) NULL,
    `skeb` VARCHAR(191) NULL,
    `fantia` VARCHAR(191) NULL,
    `tumblr` VARCHAR(191) NULL,
    `youtube` VARCHAR(191) NULL,
    `weibo` VARCHAR(191) NULL,
    `naver` VARCHAR(191) NULL,
    `namicomi` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MangaRelation` ADD CONSTRAINT `MangaRelation_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `MangaMember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
