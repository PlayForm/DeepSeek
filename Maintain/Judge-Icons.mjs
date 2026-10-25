#!/usr/bin/env node
//===============================================================================
// Judge-Icons.mjs - judge every icon, pick the best, and measure how they play.
//===============================================================================
//
// Requirements being judged:
//   1. distinctness   - no icon may sit next to another in descriptor space
//   2. richness       - enough solid paths to read as a layered icon
//   3. legibility     - an ink budget that survives 40 px
//   4. balance        - visual mass near the centre
//   5. no flooding    - the solid area must not swamp the box
//   6. contrast       - the planes must differ in weight
//   7. plays well     - neighbours must be close enough to read as a family,
//                       far enough to stay individuals
//
// Output: Temporary/Judgement.json + a ranked summary.
//
// Usage: node Maintain/Judge-Icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { genomeOf, packages } from "./Icon/Index.mjs";
import { sceneOf } from "./Icon/Transliterate.mjs";

const Root = fileURLToPath(new URL("../", import.meta.url));

const areaOf = (Points) => {
	let Sum = 0;
	for (let Index = 0; Index < Points.length; Index += 1) {
		const Next = Points[(Index + 1) % Points.length];
		Sum += Points[Index].x * Next.y - Next.x * Points[Index].y;
	}
	return Math.abs(Sum) / 2;
};

const lengthOf = (Points) => {
	let Sum = 0;
	for (let Index = 1; Index < Points.length; Index += 1) {
		Sum += Math.hypot(
			Points[Index].x - Points[Index - 1].x,
			Points[Index].y - Points[Index - 1].y,
		);
	}
	return Sum;
};

const clamp = (Value) => Math.max(0, Math.min(1, Value));
const bell = (Value, Centre, Width) => Math.exp(-(((Value - Centre) / Width) ** 2));

const measureOf = (Genome) => {
	const Scene = sceneOf(Genome, Genome.plan);
	const Components = Scene.components;
	const Solids = Components.filter(
		(Component) =>
			Component.render !== "ribbon" &&
			Component.geometry.topology === "closed" &&
			Component.material.tone !== "tint",
	);
	const Area = Solids.reduce((Sum, Component) => Sum + areaOf(Component.centerline), 0);
	const Ink = Components.reduce((Sum, Component) => Sum + lengthOf(Component.centerline), 0);
	const Mass = Components.reduce((Sum, Component) => Sum + areaOf(Component.centerline), 0);
	const Centroid = Components.reduce(
		(Sum, Component) => {
			const Part = areaOf(Component.centerline);
			const X =
				Component.centerline.reduce((Total, Point) => Total + Point.x, 0) /
				Component.centerline.length;
			const Y =
				Component.centerline.reduce((Total, Point) => Total + Point.y, 0) /
				Component.centerline.length;
			return { x: Sum.x + X * Part, y: Sum.y + Y * Part };
		},
		{ x: 0, y: 0 },
	);
	const Centre = Mass === 0 ? { x: 50, y: 50 } : { x: Centroid.x / Mass, y: Centroid.y / Mass };
	const Balance = Math.hypot(Centre.x - 50, Centre.y - 50);
	const Widths = Components.map((Component) => Component.stroke.width);
	const Contrast = Math.max(...Widths) / Math.min(...Widths);
	const Tones = new Set(Components.map((Component) => Component.material.tone)).size;
	const Profile = Genome.profile ?? {};
	return {
		dir: Genome.dir,
		role: Profile.role,
		feature: Profile.feature,
		sides: 3 + Math.max(0, Math.min(4, Number(Profile.branching) || 0)),
		rounds: 2 + Math.max(0, Math.min(4, Number(Profile.weight) || 0)),
		symmetry: Genome.plan.order,
		components: Components.length,
		area: Math.round(Area),
		ink: Math.round(Ink),
		balance: Math.round(Balance * 10) / 10,
		contrast: Math.round(Contrast * 10) / 10,
		tones: Tones,
	};
};

const Genomes = packages(Root).map((Entry) => genomeOf(Root, Entry));
const Measures = Genomes.map(measureOf);
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

for (const [Index, Entry] of Measures.entries()) {
	let Nearest = Infinity;
	let Neighbour = null;
	for (const [Other, Candidate] of Measures.entries()) {
		if (Other === Index) {
			continue;
		}
		if (String(Candidate.dir).replace(/^ets-/, "") === String(Entry.dir).replace(/^ets-/, "")) {
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
		distinctness: clamp(Nearest / 0.32),
		richness: bell(Entry.components, 26, 16),
		legibility: bell(Entry.ink, 1000, 700),
		balance: clamp(1 - Entry.balance / 12),
		flooding: clamp(1 - Entry.area / 5000),
		tones: clamp((Entry.tones - 2) / 2),
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
const BestOfRole = Roles.map((Role) => Ranked.find((Entry) => Entry.role === Role)).filter(Boolean);
const Chosen = [...new Map([...Picks, ...BestOfRole].map((Entry) => [Entry.dir, Entry])).values()];

const Nearest = Measures.map((Entry) => Entry.nearest).sort((A, B) => A - B);
const Mean = Nearest.reduce((Sum, Value) => Sum + Value, 0) / Nearest.length;
const Duplicates = Measures.filter((Entry) => Entry.nearest < 0.1).map(
	(Entry) => `${Entry.dir}~${Entry.neighbour}`,
);
const Flooded = Measures.filter((Entry) => Entry.area > 4200).length;
const Sparse = Measures.filter((Entry) => Entry.components < 12).length;
const Cluttered = Measures.filter((Entry) => Entry.components > 45).length;

mkdirSync(join(Root, "Temporary"), { recursive: true });
writeFileSync(
	join(Root, "Temporary", "Judgement.json"),
	`${JSON.stringify({ ranked: Ranked, chosen: Chosen.map((Entry) => Entry.dir) }, null, "\t")}\n`,
);

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
