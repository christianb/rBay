import { redis } from '$services/redis';
import { itemsKey, userLikesKey } from '$services/keys';

export const userLikesItem = async (itemId: string, userId: string) => {
	return redis.sIsMember(userLikesKey(userId), itemId);
};

export const likedItems = async (userId: string) => {

};

export const likeItem = async (itemId: string, userId: string) => {
	const inserted = await redis.sAdd(userLikesKey(userId), itemId);
	if (!inserted) return;

	return redis.hIncrBy(itemsKey(itemId), `likes`, 1);
};

export const unlikeItem = async (itemId: string, userId: string) => {
	const removed = await redis.sRem(userLikesKey(userId), itemId);
	if (!removed) return;

	return redis.hIncrBy(itemsKey(itemId), `likes`, -1);
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
};
