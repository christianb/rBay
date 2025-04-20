import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { redis } from '$services/redis';
import { usersKey } from '$services/keys';
import { uniqueUsernamesKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
};

export const getUserById = async (id: string) => {
	const user = await redis.hGetAll(usersKey(id));
	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();

	// check for unique usernames
	const exists = await redis.sIsMember(uniqueUsernamesKey(), attrs.username);
	if (exists == 1) {
		throw new Error('Username already exists');
	}

	await redis.hSet(usersKey(id), serialize(attrs));
	await redis.sAdd(uniqueUsernamesKey(), attrs.username);
	return id;
};

const serialize = (user: CreateUserAttrs) => {
	return {
		username: user.username,
		password: user.password
	};
};

const deserialize = (id: string, user: { [key: string]: string }) => {
	return {
		id: id,
		username: user.username,
		password: user.password
	};
};