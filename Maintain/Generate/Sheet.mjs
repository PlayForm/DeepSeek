import { join } from "node:path";

import sharp from "sharp";

export default async (Output, Names, Sheet, Label) => {
	const Cell = 96;
	const Columns = 17;
	const Rows = Math.ceil(Names.length / Columns);
	const Tiles = [];
	for (const [Index, Name] of Names.entries()) {
		const Png = await sharp(join(Output, Name), { density: 300 })
			.resize(Cell - 8, Cell - 8, { fit: "contain", background: "#ffffff" })
			.png()
			.toBuffer();
		Tiles.push({
			input: Png,
			left: (Index % Columns) * Cell + 4,
			top: Math.floor(Index / Columns) * Cell + 4,
		});
	}
	await sharp({
		create: { width: Columns * Cell, height: Rows * Cell, channels: 3, background: "#ffffff" },
	})
		.composite(Tiles)
		.png()
		.toFile(Sheet);
	console.log(`${Label}: ${Columns * Cell}x${Rows * Cell}`);
};
