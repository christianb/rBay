import { itemsByViewsKey } from '$services/keys';
import { viewItemsBy } from '$services/utils/view-items-by';

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	return viewItemsBy(itemsByViewsKey(), order, offset, count)
};
