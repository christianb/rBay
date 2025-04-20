import { redis } from '$services/redis';
import { itemsKey, itemsByViewsKey } from '$services/keys';

export const incrementView = async (itemId: string, userId: string) => {
	return Promise.all([
		redis.hIncrBy(itemsKey(itemId), 'views', 1),
		redis.zIncrBy(itemsByViewsKey(), 1, itemId)
	]);
};
