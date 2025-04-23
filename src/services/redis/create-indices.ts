import { redis } from './redis-client';
import { SchemaFieldTypes } from 'redis';
import { itemsIndexKey, itemsKey } from '$services/keys';

export const createIndices = async () => {
	const indices = await redis.ft._list();
	const exists = indices.find(index => index === itemsIndexKey());
	if (exists) return;

	return redis.ft.create(
		itemsIndexKey(),
		{
			name: {
				type: SchemaFieldTypes.TEXT,
			},
			description: {
				type: SchemaFieldTypes.TEXT,
			},
		},
		{
			ON: 'HASH',
			PREFIX: itemsKey(''),
		},
	);
};
