import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { redis } from '$services/redis';
import { usersKey, uniqueUsernamesKey, usernamesKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
	const decimalId = await redis.zScore(usernamesKey(), username);
	if (!decimalId) throw Error(`User with username "${username}" does not exist`);

	const id = decimalId.toString(16);
	const user = await redis.hGetAll(usersKey(id));
	return deserialize(id, user)
};

export const getUserById = async (id: string) => {
	const user = await redis.hGetAll(usersKey(id));
	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	// check for unique usernames
	const exists = await redis.sIsMember(uniqueUsernamesKey(), attrs.username);
	if (exists) throw new Error('Username already exists');

	const id: string = await genUniqueUserId();

	await redis.hSet(usersKey(id), serialize(attrs));
	await redis.sAdd(uniqueUsernamesKey(), attrs.username);

	// TODO a standard redis hash would work as well
	await redis.zAdd(usernamesKey(), {
		value: attrs.username,
		score: parseInt(id, 16)
	});

	return id;
};

const genUniqueUserId = async () => {
	let id: string;
	do {
		id = genId();
	} while (await redis.exists(usersKey(id)));

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