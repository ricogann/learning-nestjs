import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
			})
		);
		await app.init();
		await app.listen(3333);

		prisma = app.get(PrismaService);

		await prisma.cleanDb();
		pactum.request.setBaseUrl('http://localhost:3333');
	});

	afterAll(() => {
		app.close();
	});

	describe('Auth', () => {
		const dto: AuthDto = {
			email: 'rico.putra95@gmail.com',
			password: '123456',
		};
		describe('Signup', () => {
			it('should throw if email empty', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({ password: dto.password })
					.expectStatus(400);
			});

			it('should throw if password empty', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({ email: dto.email })
					.expectStatus(400);
			});

			it('should throw if no body', () => {
				return pactum.spec().post('/auth/signup').expectStatus(400);
			});

			it('should signup', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto)
					.expectStatus(201);
			});
		});

		describe('Signin', () => {
			const dto: AuthDto = {
				email: 'rico.putra95@gmail.com',
				password: '123456',
			};

			it('should throw if email empty', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody({ password: dto.password })
					.expectStatus(400);
			});

			it('should throw if password empty', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody({ email: dto.email })
					.expectStatus(400);
			});

			it('should throw if no body', () => {
				return pactum.spec().post('/auth/signin').expectStatus(400);
			});

			it('should signin', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto)
					.expectStatus(200)
					.stores('token', 'token');
			});
		});
	});

	describe('User', () => {
		describe('Get me', () => {
			it('should get current user', () => {
				return pactum
					.spec()
					.get('/users/me')
					.expectStatus(200)
					.withHeaders({
						Authorization: 'Bearer $S{token}',
					});
			});
		});

		describe('Edit User', () => {
			it('should edit current user', () => {
				const dto: EditUserDto = {
					firstName: 'Ricogan',
					email: 'yayaya@gmail.com',
				};
				return pactum
					.spec()
					.patch('/users')
					.withHeaders({
						Authorization: 'Bearer $S{token}',
					})
					.withBody(dto)
					.expectStatus(200);
			});
		});
	});

	describe('Bookmark', () => {
		describe('Get empty Bookmarks', () => {
			it('should get bookmarks', () => {
				return pactum
					.spec()
					.get('/bookmarks')
					.withHeaders({
						Authorization: 'Bearer $S{token}',
					})
					.expectStatus(200)
					.expectBody([]);
			});
		});

		describe('Create Bookmark', () => {
			const dto: CreateBookmarkDto = {
				title: 'First Bookmark',
				link: 'https://www.youtube.com/watch?v=GHTA143_b-s&t=10219s',
			};
			it('should create bookmarks', () => {
				return pactum
					.spec()
					.post('/bookmarks')
					.withHeaders({
						Authorization: 'Bearer $S{token}',
					})
					.withBody(dto)
					.expectStatus(201)
					.stores('bookmarkId', 'id');
			});
		});

		describe('Get Bookmarks', () => {
			it('should get bookmarks', () => {
				return pactum
					.spec()
					.get('/bookmarks')
					.withHeaders({
						Authorization: 'Bearer $S{token}',
					})
					.expectStatus(200)
					.expectJsonLength(1);
			});
		});

		describe('Get Bookmark by ID', () => {
			it('should get bookmarks by ID', () => {
				return pactum
					.spec()
					.get('/bookmarks/{id}')
					.withPathParams('id', '$S{bookmarkId}')
					.withHeaders({
						Authorization: 'Bearer $S{token}',
					})
					.expectStatus(200)
					.inspect();
			});
		});

		describe('Edit Bookmark', () => {
			const dto: EditBookmarkDto = {
				title: 'NestJs Course for Beginners - Create a REST API',
				description:
					'Learn NestJs by building a CRUD REST API with end-to-end tests using modern web development techniques. NestJs is a rapidly growing node js framework that helps build scalable and maintainable backend applications.',
			};
			it('should edit bookmarks', () => {
				return pactum
					.spec()
					.patch('/bookmarks/{id}')
					.withPathParams('id', '$S{bookmarkId}')
					.withHeaders({
						Authorization: 'Bearer $S{token}',
					})
					.withBody(dto)
					.expectStatus(200)
					.inspect();
			});
		});

		describe('Delete Bookmark', () => {
			it('should delete bookmark', () => {
				return pactum
					.spec()
					.delete('/bookmarks/{id}')
					.withPathParams('id', '$S{bookmarkId}')
					.withHeaders({
						Authorization: 'Bearer $S{token}',
					})
					.expectStatus(204)
					.inspect();
			});
		});
	});
});
