const Clamp = (Value) => Math.max(0, Math.min(1, Value));
const Bell = (Value, Centre, Width) => Math.exp(-(((Value - Centre) / Width) ** 2));

const Vector = (Entry) => [
	Entry.sides / 7,
	Entry.rounds / 6,
	Entry.symmetry / 12,
	Entry.components / 60,
	Entry.ink / 2200,
	Entry.area / 5000,
	Entry.tones / 4,
	(Entry.role === "governor" || Entry.role === "store"
		? 1
		: Entry.role === "orchestrator"
			? 2
			: 0) / 2,
];
const Distance = (A, B) => {
	const Left = Vector(A);
	const Right = Vector(B);
	return Math.hypot(...Left.map((Value, Index) => Value - Right[Index]));
};

export default (Measures) => {
	for (const [Index, Entry] of Measures.entries()) {
		let Nearest = Infinity;
		let Neighbour = null;
		for (const [Other, Candidate] of Measures.entries()) {
			if (Other === Index) {
				continue;
			}
			if (
				String(Candidate.dir).replace(/^ets-/, "") ===
				String(Entry.dir).replace(/^ets-/, "")
			) {
				continue;
			}
			const DistanceValue = Distance(Entry, Candidate);
			if (DistanceValue < Nearest) {
				Nearest = DistanceValue;
				Neighbour = Candidate.dir;
			}
		}
		Entry.nearest = Math.round(Nearest * 1000) / 1000;
		Entry.neighbour = Neighbour;
		const Scores = {
			distinctness: Clamp(Nearest / 0.32),
			richness: Bell(Entry.components, 26, 16),
			legibility: Bell(Entry.ink, 1000, 700),
			balance: Clamp(1 - Entry.balance / 12),
			flooding: Clamp(1 - Entry.area / 5000),
			tones: Clamp((Entry.tones - 2) / 2),
		};
		Entry.scores = Object.fromEntries(
			Object.entries(Scores).map(([Key, Value]) => [Key, Math.round(Value * 100) / 100]),
		);
		Entry.potential =
			Math.round(
				(Scores.distinctness * 0.3 +
					Scores.richness * 0.15 +
					Scores.legibility * 0.2 +
					Scores.balance * 0.1 +
					Scores.flooding * 0.15 +
					Scores.tones * 0.1) *
					100,
			) / 100;
		Entry.compromises = Object.entries(Entry.scores)
			.filter(([, Value]) => Value < 0.4)
			.map(([Key]) => Key);
	}

	const Ranked = [...Measures].sort((A, B) => B.potential - A.potential);
	const Picks = Ranked.slice(0, 60);
	const Roles = [...new Set(Measures.map((Entry) => Entry.role))];
	const BestOfRole = Roles.map((Role) => Ranked.find((Entry) => Entry.role === Role)).filter(
		Boolean,
	);
	const Chosen = [
		...new Map([...Picks, ...BestOfRole].map((Entry) => [Entry.dir, Entry])).values(),
	];
	return { Ranked, Chosen, Roles };
};
