import type { CreateItemAttrs } from '$services/types';
import { redis } from '$services/redis';
import { serialize } from '$services/queries/items/serialize';
import { genId } from '$services/utils';
import { itemsKey, itemsByViewsKey, itemsByEndingAtKey, itemsByPriceKey } from '$services/keys';
import { deserialize } from '$services/queries/items/deserialize';

export const getItem = async (id: string) => {
	const item = await redis.hGetAll(itemsKey(id));
	if (Object.keys(item).length === 0) {
		return null;
	}
	return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
	const commands = ids.map((id) => {
		return redis.hGetAll(itemsKey(id));
	});

	const results = await Promise.all(commands);

	return results.map((result, i) => {
		if (Object.keys(result).length === 0) {
			return null;
		}
		return deserialize(ids[i], result);
	});
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
	const id = genId();
	const serialized = serialize(attrs);

	await Promise.all([
		// pipelining, sending a single command to Redis
		redis.hSet(itemsKey(id), serialized),
		redis.zAdd(itemsByViewsKey(), {
			value: id,
			score: 0,
		}),
		redis.zAdd(itemsByEndingAtKey(), {
			value: id,
			score: attrs.endingAt.toMillis(),
		}),
		redis.zAdd(itemsByPriceKey(), {
			value: id,
			score: 0,
		}),
	]);

	return id;
};