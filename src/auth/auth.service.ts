import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService
	) {}

	async signup(dto: AuthDto) {
		try {
			//generate the password hash
			const hash = await argon.hash(dto.password);
			//save the new user in the database
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					hash: hash,
				},
			});

			delete user.hash;
			//return the saved user
			return user;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('Email Already Taken.');
				}
			}
			throw error;
		}
	}

	async signin(dto: AuthDto) {
		//find the user by email
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});

		//if user doesn't exist, throw an error
		if (!user) {
			throw new ForbiddenException('User not found.');
		}

		//compare the password hash with the password
		const match = await argon.verify(user.hash, dto.password);
		//if the password doesn't match, throw an error
		if (!match) {
			throw new ForbiddenException('Wrong Password.');
		}

		//if the password matches, return the user
		// return ;
		delete user.hash;
		return {
			status: 'success',
			message: 'User logged in successfully.',
			token: await this.signToken(user.id, user.email),
		};
	}

	async signToken(userId: number, email: string): Promise<string> {
		const payload = {
			sub: userId,
			email: email,
		};

		const secret = this.config.get('JWT_SECRET');

		return this.jwt.signAsync(payload, {
			secret: secret,
			expiresIn: '15m',
		});
	}
}
