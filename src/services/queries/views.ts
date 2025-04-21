import { redis } from '$services/redis';
import { itemsKey, itemsByViewsKey, itemsViewsKey } from '$services/keys';

export const incrementView = async (itemId: string, userId: string) => {
	const inserted = await redis.pfAdd(itemsViewsKey(itemId), userId)
	if (!inserted) return

	return Promise.all([
		redis.hIncrBy(itemsKey(itemId), 'views', 1),
		redis.zIncrBy(itemsByViewsKey(), 1, itemId)
	]);
};
