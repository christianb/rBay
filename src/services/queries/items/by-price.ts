import { itemsByPriceKey } from '$services/keys';
import { viewItemsBy } from '$services/utils/view-items-by';

export const itemsByPrice = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	return viewItemsBy(itemsByPriceKey(), order, offset, count)
};
