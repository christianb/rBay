import { client } from '$services/redis';

const cacheRoutes = ['/about', '/privacy', '/auth/signin', '/auth/signout'];

const pageCacheKey = (id: string) => `pagecache#${id}`;

export const getCachedPage = (route: string) => {
	if (!cacheRoutes.includes(route)) return null;
	return client.get(pageCacheKey(route))
};

export const setCachedPage = (route: string, page: string) => {
	if (!cacheRoutes.includes(route)) return null;
	return client.set(pageCacheKey(route), page, { EX: 2})
};
