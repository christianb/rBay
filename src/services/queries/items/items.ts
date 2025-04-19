import type { CreateItemAttrs } from '$services/types';
import { redis } from '$services/redis';
import { serialize } from '$services/queries/items/serialize';
import { genId } from '$services/utils';
import { itemsKey } from '$services/keys';
import { deserialize } from '$services/queries/items/deserialize';

export const getItem = async (id: string) => {
	const item = await redis.hGetAll(itemsKey(id));
	return extractFromRedisResponse(item, id);
};

export const getItems = async (ids: string[]) => {
	const commands = ids.map((id) => {
		return redis.hGetAll(itemsKey(id));
	});

	const results = await Promise.all(commands);

	return results.map((result, i) => {
		extractFromRedisResponse(result, ids[i]);
	});
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
	const id = genId();
	const serialized = serialize(attrs);
	await redis.hSet(itemsKey(id), serialized);
	return id;
};

const extractFromRedisResponse = (item, id: string) => {
	if (Object.keys(item).length === 0) {
		return null;
	}
	return deserialize(id, item);
};
