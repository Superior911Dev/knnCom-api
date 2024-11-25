/*
  Warnings:

  - You are about to drop the column `createdAt` on the `product` table. All the data in the column will be lost.
  - Made the column `shopee` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `coverImage` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `images` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `createdAt`,
    MODIFY `shopee` TEXT NOT NULL,
    MODIFY `coverImage` VARCHAR(191) NOT NULL,
    MODIFY `images` TEXT NOT NULL;
