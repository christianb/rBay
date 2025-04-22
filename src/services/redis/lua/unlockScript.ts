import { defineScript } from 'redis';

export const unlockScript = defineScript({
	NUMBER_OF_KEYS: 1,
	SCRIPT: `
				local lockKey = KEYS[1]
				local token = ARGV[1]
				
				if redis.call('GET', lockKey) == token then
					return redis.call('DEL', lockKey)
				end
			`,
	transformArguments(key: string, token: string) {
		return [key, token];
	},
	transformReply(reply: any) {
		return reply
	},
});