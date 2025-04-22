import { defineScript } from 'redis';
import { itemsByViewsKey, itemsKey, itemsViewsKey } from '$services/keys';

export const incrementViewScript = defineScript({
	NUMBER_OF_KEYS: 3,
	SCRIPT: `
				local itemViewsKey = KEYS[1]
				local itemsKey = KEYS[2]
				local itemByViewsKey = KEYS[3]
				
				local itemId = ARGV[1]
				local userId = ARGV[2]
				
				local inserted = redis.call('PFADD', itemViewsKey, userId)
				
				if inserted == 1 then
					redis.call('HINCRBY', itemsKey, 'views', 1)
					redis.call('ZINCRBY', itemByViewsKey, 1, itemId)
				end
	`,
	transformArguments(itemId: string, userId: string) {
		return [
			itemsViewsKey(itemId),
			itemsKey(itemId),
			itemsByViewsKey(),
			itemId,
			userId,
		];
	},
	transformReply() {
		// not expecting any value from lua script
	},
});