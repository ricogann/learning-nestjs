import {
	Controller,
	UseGuards,
	Get,
	Patch,
	Post,
	Delete,
	Param,
	ParseIntPipe,
	Body,
	HttpStatus,
	HttpCode,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
	constructor(private bookmark: BookmarkService) {}

	@Post()
	createBookmark(
		@GetUser('id') userId: number,
		@Body() dto: CreateBookmarkDto
	) {
		return this.bookmark.createBookmark(userId, dto);
	}

	@Get('/')
	getBookmarks(@GetUser('id') userId: number) {
		return this.bookmark.getBookmarks(userId);
	}

	@Get(':id')
	getBookmarksById(
		@GetUser('id') userId: number,
		@Param('id', ParseIntPipe) bookmarkId: number
	) {
		return this.bookmark.getBookmarksById(userId, bookmarkId);
	}

	@Patch(':id')
	editBookmarkById(
		@GetUser('id') userId: number,
		@Param('id', ParseIntPipe) bookmarkId: number,
		@Body() dto: EditBookmarkDto
	) {
		return this.bookmark.editBookmarkById(userId, bookmarkId, dto);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	deleteBookmarkById(
		@GetUser('id') userId: number,
		@Param('id', ParseIntPipe) bookmarkId: number
	) {
		return this.bookmark.deleteBookmarkById(userId, bookmarkId);
	}
}
