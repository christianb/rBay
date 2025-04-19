import type { Session } from '$services/types';
import { sessionsKey } from '$services/keys';
import { redis } from '$services/redis';

export const getSession = async (id: string) => {
	const session = await redis.hGetAll(sessionsKey(id)); // redis returns an empty object {} when the session key can not be resolved
	if (Object.keys(session).length === 0) {
		return null;
	}
	return deserialize(id, session);
};

export const saveSession = async (session: Session) => {
	return redis.hSet(sessionsKey(session.id), serialize(session));
};

const deserialize = (id: string, session: { [key: string]: string }) => {
	return {
		id: id,
		userId: session.userId,
		username: session.username
	};
};

const serialize = (session: Session) => {
	return {
		userId: session.userId,
		username: session.username,
	}
}