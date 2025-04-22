import { redis } from '$services/redis';

export const incrementView = async (itemId: string, userId: string) => {
	redis.incrementView(itemId, userId)
};
