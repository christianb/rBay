import { createClient, defineScript } from 'redis';
import { incrementViewScript } from '$services/redis/lua/incrementViewScript';
import { unlockScript } from '$services/redis/lua/unlockScript';

const redis = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT),
	},
	password: process.env.REDIS_PW,
	scripts: {
		incrementView: incrementViewScript,
		unlock: unlockScript
	},
});

redis.on('error', (err) => console.error(err));
redis.connect();

export { redis };