import { randomBytes } from 'crypto';
import { redis } from '$services/redis/redis-client';

export const withLock = async (key: string, callback: (proxy: Redis, signal: any) => any) => {
	const retryDelayInMillis = 100;
	const maxRetries = 20;
	const timeoutInMillis = maxRetries * retryDelayInMillis;
	const token = randomBytes(6).toString('hex'); // generate a random value to store at the lock key
	const lockKey = `lock:${key}`; // create the lock key

	let retries = maxRetries;
	while (retries >= 0) {
		retries -= 1;

		// set the lock
		const aquired = await redis.set(lockKey, token, {
			NX: true,
			PX: timeoutInMillis,
		});
		if (!aquired) {
			await pause(retryDelayInMillis); // brief pause and then retry
			continue;
		}

		try {
			const signal = { expired: false };
			setTimeout(() => {
				signal.expired = true;
			}, timeoutInMillis);

			const proxy: Redis = buildClientProxy(timeoutInMillis);
			return await callback(proxy, signal);
		} finally {
			// finally unset the lock key
			await redis.unlock(lockKey, token);
		}
	}
};

type Redis = typeof redis
const buildClientProxy = (timeoutInMillis: number) => {
	const startTime = Date.now();
	const handler = {
		get(target: Redis, prop: keyof Redis) {
			if (Date.now() >= startTime + timeoutInMillis) throw new Error(`Lock has expired`);
			const value = target[prop];
			return typeof value === 'function' ? value.bind(target) : value;
		},
	};
	return new Proxy(redis, handler) as Redis;
};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
