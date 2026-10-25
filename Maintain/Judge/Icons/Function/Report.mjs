export default ({ Measures, Ranked, Chosen, Roles }) => {
	const Nearest = Measures.map((Entry) => Entry.nearest).sort((A, B) => A - B);
	const Mean = Nearest.reduce((Sum, Value) => Sum + Value, 0) / Nearest.length;
	const Duplicates = Measures.filter((Entry) => Entry.nearest < 0.1).map(
		(Entry) => `${Entry.dir}~${Entry.neighbour}`,
	);
	const Flooded = Measures.filter((Entry) => Entry.area > 4200).length;
	const Sparse = Measures.filter((Entry) => Entry.components < 12).length;
	const Cluttered = Measures.filter((Entry) => Entry.components > 45).length;

	console.log(`judged ${Measures.length} icons`);
	console.log(`mean nearest-neighbour distance: ${Math.round(Mean * 1000) / 1000}`);
	console.log(
		`near-duplicate pairs (<0.10): ${Duplicates.length}${Duplicates.length === 0 ? "" : ` - ${Duplicates.slice(0, 5).join(", ")}`}`,
	);
	console.log(
		`flooded (>4200 area): ${Flooded}, sparse (<12 components): ${Sparse}, cluttered (>45): ${Cluttered}`,
	);
	console.log(`chosen: ${Chosen.length} (top 60 plus the best of each of ${Roles.length} roles)`);
	console.log("");
	console.log("top 12:");
	for (const Entry of Ranked.slice(0, 12)) {
		console.log(
			`  ${Entry.potential.toFixed(2)}  ${Entry.dir}  [${Entry.role}/${Entry.feature}]  sides ${Entry.sides} rounds ${Entry.rounds} comp ${Entry.components} ink ${Entry.ink} area ${Entry.area} nearest ${Entry.nearest}`,
		);
	}
	console.log("");
	console.log("bottom 8:");
	for (const Entry of Ranked.slice(-8)) {
		console.log(
			`  ${Entry.potential.toFixed(2)}  ${Entry.dir}  compromises: ${Entry.compromises.join(", ") || "none"}`,
		);
	}
	console.log("");
	console.log("compromise census:");
	const Census = new Map();
	for (const Entry of Measures) {
		for (const Compromise of Entry.compromises) {
			Census.set(Compromise, (Census.get(Compromise) ?? 0) + 1);
		}
	}
	for (const [Name, Count] of [...Census.entries()].sort((A, B) => B[1] - A[1])) {
		console.log(`  ${Name}: ${Count}`);
	}
};
