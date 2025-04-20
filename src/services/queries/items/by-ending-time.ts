import { redis } from '$services/redis';
import { itemsKey, itemsByEndingAtKey } from '$services/keys';
import { deserialize } from '$services/queries/items/deserialize';

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
	const ids = await redis.zRange(
		itemsByEndingAtKey(),
		Date.now(),
		'+inf',
		{
			BY: 'SCORE',
			LIMIT: {
				offset, count
			}
		}
	);

	const results = await Promise.all(ids.map((id) => redis.hGetAll(itemsKey(id))));
	return results.map((item, i: number) => deserialize(ids[i], item));
};
