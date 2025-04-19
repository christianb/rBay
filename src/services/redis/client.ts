import { createClient } from 'redis';

const redis = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW
});

redis.on('error', (err) => console.error(err));
redis.connect();

export { redis };
