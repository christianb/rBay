import type { CreateBidAttrs, Bid } from '$services/types';
import { bidHistoryKey, itemsKey, itemsByPriceKey } from '$services/keys';
import { redis, withLock } from '$services/redis';
import { DateTime } from 'luxon';
import { getItem } from '$services/queries/items';

export const createBid = async (attrs: CreateBidAttrs): Promise<any> =>
	withLock(attrs.itemId, async (redisProxy, signal: any) => {
		const item = await getItem(attrs.itemId);

		if (!item) throw Error(`Item "${attrs.itemId}" not found`);
		if (item.price >= attrs.amount) throw Error(`Bid too low`);
		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) throw Error(`Bidding closed for item"`);

		const serialized = serializeBidHistory(attrs.amount, attrs.createdAt.toMillis());
		if (signal.expired) throw new Error('Lock expired, can not write any more data');

		return Promise.all([
			redisProxy.rPush(bidHistoryKey(attrs.itemId), serialized),
			redisProxy.hSet(itemsKey(item.id), {
				bids: item.bids + 1,
				price: attrs.amount,
				highestBidUserId: attrs.userId,
			}),
			redisProxy.zAdd(itemsByPriceKey(), {
				value: item.id,
				score: attrs.amount,
			}),
		]);
	});

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