import type { CreateItemAttrs } from '$services/types';
import { redis } from '$services/redis';
import { serialize } from '$services/queries/items/serialize';
import { genId } from '$services/utils';
import { itemsKey } from '$services/keys';
import { deserialize } from '$services/queries/items/deserialize';

export const getItem = async (id: string) => {
	const item = await redis.hGetAll(itemsKey(id));
	if (Object.keys(item).length === 0) {
		return null
	}
	return deserialize(id, item)
};

export const getItems = async (ids: string[]) => {};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
	const id = genId();
	const serialized = serialize(attrs);
	await  redis.hSet(itemsKey(id), serialized);
	return id
};
