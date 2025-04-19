import { redis } from '$services/redis';
import { pageCacheKey } from '$services/keys';

const cacheRoutes = ['/about', '/privacy', '/auth/signin', '/auth/signout'];

export const getCachedPage = (route: string) => {
	if (!cacheRoutes.includes(route)) return null;
	return redis.get(pageCacheKey(route))
};

export const setCachedPage = (route: string, page: string) => {
	if (!cacheRoutes.includes(route)) return null;
	return redis.set(pageCacheKey(route), page, { EX: 2})
};
