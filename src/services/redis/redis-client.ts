import { createClient, defineScript } from 'redis';
import { itemsByViewsKey, itemsKey, itemsViewsKey } from '$services/keys';

const redis = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT),
	},
	password: process.env.REDIS_PW,
	scripts: {
		incrementView: defineScript({
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
		}),
	},
});

redis.on('error', (err) => console.error(err));
redis.connect();

export { redis };
