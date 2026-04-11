const defaultOptions: IFluentOptions = {
	minHeight: 180,
	maxHeight: 220,
	maxPotraitHeight: 250,
	width: 1024,
	padding: 10
}

export interface IFluentOptions {
	minHeight: number;
	maxHeight: number;
	maxPotraitHeight: number;
	width: number;
	padding: number;
}

export interface IFluentCell {
	height: number;
	width: number;
	item: any;
	items: any[],
	index: number;
}

export interface IFluentRow {
	height: number;
	top: number;
	columns: IFluentCell[];
}

/**
 * Fluent layout - creates a single image per row layout.
 * Each image is scaled to fit the available width while maintaining its aspect ratio.
 */
export const fluent = (items, options): IFluentRow[] => {
	const { minHeight, maxHeight, maxPotraitHeight, width, padding } = Object.assign({}, defaultOptions, options);

	const result: IFluentRow[] = [];

	items.forEach((item, index) => {
		const { width: itemWidth, height: itemHeight } = item;
		const aspectRatio = itemWidth / itemHeight;

		// Determine the target height based on the aspect ratio
		let targetHeight = aspectRatio < 1 ? maxPotraitHeight : maxHeight;

		// Calculate the scaled width for the image
		let scaledWidth = +(targetHeight * aspectRatio).toFixed();

		if (scaledWidth + 50 >= width) {
			scaledWidth = width - 50;
			targetHeight = +(scaledWidth / aspectRatio).toFixed();

			if (targetHeight < minHeight) {
				targetHeight = minHeight;
				scaledWidth = +(targetHeight * aspectRatio).toFixed();
			}
		}

		// Create a single row with one image
		const row: IFluentRow = {
			height: targetHeight,
			top: 0, // This will be adjusted later
			columns: [
				{
					width: scaledWidth,
					height: targetHeight,
					item,
					items,
					index,
				},
			],
		};
		result.push(row);
	});

	// Adjust the `top` property for each row
	let lastTop = 0;
	result.forEach((row) => {
		row.top = lastTop;
		lastTop += row.height + padding;
	});

	return result;
};
