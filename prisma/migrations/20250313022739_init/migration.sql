-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `torii_token` VARCHAR(255) NULL,
    `is_confirmed_mail` BOOLEAN NOT NULL DEFAULT false,
    `is_moderator` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserConfirmation` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `group` ENUM('CONTENT', 'FORMAT', 'GENRE', 'THEME') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MangaRelation` (
    `id` VARCHAR(191) NOT NULL,
    `manga_id` VARCHAR(191) NOT NULL,
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

-- CreateTable
CREATE TABLE `Manga` (
    `id` VARCHAR(191) NOT NULL,
    `cover_art` VARCHAR(191) NULL,
    `status` ENUM('ongoing', 'completed', 'hiatus', 'cancelled') NOT NULL,
    `title` VARCHAR(5000) NOT NULL,
    `altTitles` JSON NOT NULL,
    `originalLanguage` VARCHAR(191) NOT NULL DEFAULT 'JA',
    `avaliableLanguage` JSON NOT NULL,
    `cpReset` BOOLEAN NOT NULL DEFAULT false,
    `description` JSON NOT NULL,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `rating` ENUM('SAFE', 'SUGESTIVE', 'EROTICA') NOT NULL DEFAULT 'SAFE',
    `year` INTEGER NOT NULL DEFAULT 2025,
    `publicDemographic` VARCHAR(191) NOT NULL,
    `tags` JSON NOT NULL,
    `anilist_id` VARCHAR(191) NULL,
    `animeplanet_id` VARCHAR(191) NULL,
    `mal_id` VARCHAR(191) NULL,
    `kitsu_id` VARCHAR(191) NULL,
    `mangaupdate_id` VARCHAR(191) NULL,
    `bookwalker_url` VARCHAR(1000) NULL,
    `amazon_url` VARCHAR(1000) NULL,
    `ebookjp_url` VARCHAR(1000) NULL,
    `raw_url` VARCHAR(1000) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL DEFAULT 'Scan Without name',
    `contact_email` VARCHAR(255) NULL,
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `discord` VARCHAR(191) NULL,
    `website` VARCHAR(255) NULL,
    `twitter` VARCHAR(255) NULL,
    `focused_language` JSON NOT NULL,
    `official` BOOLEAN NOT NULL DEFAULT false,
    `verified` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chapther` (
    `id` VARCHAR(191) NOT NULL,
    `manga_id` VARCHAR(191) NOT NULL,
    `volume` VARCHAR(191) NOT NULL DEFAULT '',
    `chapther` DOUBLE NOT NULL DEFAULT 0,
    `title` VARCHAR(255) NOT NULL DEFAULT '',
    `language` VARCHAR(191) NOT NULL DEFAULT 'EN',
    `pages` INTEGER NOT NULL DEFAULT 0,
    `scan_id` VARCHAR(191) NOT NULL,
    `publishAt` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChaptherImage` (
    `id` VARCHAR(191) NOT NULL,
    `chapther_id` VARCHAR(191) NOT NULL,
    `delete_at` DATETIME(3) NOT NULL,
    `base_url` VARCHAR(191) NOT NULL,
    `data_images` JSON NOT NULL,
    `low_images` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChaptherTranslated` (
    `id` VARCHAR(191) NOT NULL,
    `chapther_id` VARCHAR(191) NOT NULL,
    `target_language` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `pages` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MangaRelation` ADD CONSTRAINT `MangaRelation_manga_id_fkey` FOREIGN KEY (`manga_id`) REFERENCES `Manga`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chapther` ADD CONSTRAINT `Chapther_manga_id_fkey` FOREIGN KEY (`manga_id`) REFERENCES `Manga`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chapther` ADD CONSTRAINT `Chapther_scan_id_fkey` FOREIGN KEY (`scan_id`) REFERENCES `Scan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChaptherImage` ADD CONSTRAINT `ChaptherImage_chapther_id_fkey` FOREIGN KEY (`chapther_id`) REFERENCES `Chapther`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChaptherTranslated` ADD CONSTRAINT `ChaptherTranslated_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
