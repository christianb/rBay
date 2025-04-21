import type { CreateBidAttrs, Bid } from '$services/types';
import { bidHistoryKey } from '$services/keys';
import { redis } from '$services/redis';
import { DateTime } from 'luxon';

export const createBid = async (attrs: CreateBidAttrs) => {
	const serialized = serializeBidHistory(attrs.amount, attrs.createdAt.toMillis());
	return redis.rPush(bidHistoryKey(attrs.itemId), serialized);
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const endIndex = -1 - offset;

	const range = await redis.lRange(bidHistoryKey(itemId), startIndex, endIndex);
	return range.map(bid => deserializeBidHistory(bid));
};

const serializeBidHistory = (amount: number, createdAt: number) => {
	return `${amount}:${createdAt}`;
};

const deserializeBidHistory = (stored: string) => {
	const [amount, createdAt] = stored.split(':');
	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(createdAt)),
	};
};