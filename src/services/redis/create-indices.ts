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
				sortable: true,
			},
			description: {
				type: SchemaFieldTypes.TEXT,
				sortable: false,
			},
			ownerId: {
				type: SchemaFieldTypes.TAG,
				sortable: false,
			},
			endingAt: {
				type: SchemaFieldTypes.NUMERIC,
				sortable: true,
			},
			bids: {
				type: SchemaFieldTypes.NUMERIC,
				sortable: true,
			},
			views: {
				type: SchemaFieldTypes.NUMERIC,
				sortable: true,
			},
			price: {
				type: SchemaFieldTypes.NUMERIC,
				sortable: true,
			},
			likes: {
				type: SchemaFieldTypes.NUMERIC,
				sortable: true,
			},
		},
		{
			ON: 'HASH',
			PREFIX: itemsKey(''),
		},
	);
};
