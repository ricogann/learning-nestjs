import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable({})
export class BookmarkService {
	constructor(private prisma: PrismaService) {}

	async createBookmark(userId: number, dto: CreateBookmarkDto) {
		const bookmark = await this.prisma.bookmark.create({
			data: {
				userId,
				...dto,
			},
		});

		return bookmark;
	}

	getBookmarks(userId: number) {
		return this.prisma.bookmark.findMany({
			where: {
				userId,
			},
		});
	}

	getBookmarksById(userId: number, bookmarkId: number) {
		return this.prisma.bookmark.findUnique({
			where: {
				id: bookmarkId,
				userId,
			},
		});
	}

	async editBookmarkById(
		userId: number,
		bookmarkId: number,
		dto: EditBookmarkDto
	) {
		const bookmark = await this.prisma.bookmark.findUnique({
			where: {
				id: bookmarkId,
			},
		});

		if (!bookmark || bookmark.userId !== userId) {
			throw new ForbiddenException('Access to resources Denied');
		}

		return this.prisma.bookmark.update({
			where: {
				id: bookmarkId,
			},
			data: {
				...dto,
			},
		});
	}

	deleteBookmarkById(userId: number, bookmarkId: number) {
		return this.prisma.bookmark.delete({
			where: {
				id: bookmarkId,
				userId,
			},
		});
	}
}
