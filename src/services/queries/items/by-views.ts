import { redis } from '$services/redis';
import { itemsKey, itemsByViewsKey } from '$services/keys';
import { deserialize } from '$services/queries/items/deserialize';

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	let results: any = await redis.sort(
		itemsByViewsKey(),
		{
			GET: [
				'#', // means get the underlying id of the key
				`${itemsKey('*')}->name`, // gets the value for the name key from items#${id}
				`${itemsKey('*')}->views`,
				`${itemsKey('*')}->endingAt`,
				`${itemsKey('*')}->imageUrl`,
				`${itemsKey('*')}->price`,
			],
			BY: 'nosort', // the nosort key does not exist so it will not do a sorting, convention is to use nosort but any other none existing key would do the same
			DIRECTION: order,
			LIMIT: { offset, count },
		},
	);

	const items = [];
	while (results.length) {
		const [id, name, views, endingAt, imageUrl, price, ...rest] = results;
		const item = deserialize(id, { name, views, endingAt, imageUrl, price });
		items.push(item);
		results = rest;
	}

	return items;
};
