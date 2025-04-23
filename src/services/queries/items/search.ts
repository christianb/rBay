import { redis } from '$services/redis';
import { deserialize } from '$services/queries/items/deserialize';
import { itemsIndexKey } from '$services/keys';

export const searchItems = async (term: string, size: number = 5) => {
	const cleanedSearchTerm = term
		.replaceAll(/[^a-zA-Z0-9 ]/g, '')
		.trim()
		.split(' ')
		.map((word) => word ? `%${word}%` : '')
		.join(' ');

	if (cleanedSearchTerm === '') return [];

	const query = `(@name:(${cleanedSearchTerm}) => { $weight: 5.0 }) | (@description:${cleanedSearchTerm})`;
	const results = await redis.ft.search(
		itemsIndexKey(),
		query, {
			LIMIT: {
				from: 0,
				size: size,
			},
		},
	);

	return results.documents.map(({ id, value }) => deserialize(id, value));
};
