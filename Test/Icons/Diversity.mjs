#!/usr/bin/env node
//===============================================================================
// Diversity.mjs - the collection-level diversity arbiter (degenerative scene).
//===============================================================================
//
// The scene is a decayed seed, so the descriptor records the decay: the seed
// side count, the decay rounds, the plate shape, the component count, the tone
// pattern, and the ink length. A narrow decay schedule shows up here.

import { fileURLToPath } from "node:url";

import { genomeOf, packages } from "../../Maintain/Icon/Index.mjs";
import { sceneOf } from "../../Maintain/Icon/Transliterate.mjs";

const Root = fileURLToPath(new URL("../../", import.meta.url));

const lengthOf = (Points, Closed) => {
	let Sum = 0;
	for (let Index = 1; Index < Points.length; Index += 1) {
		Sum += Math.hypot(Points[Index].x - Points[Index - 1].x, Points[Index].y - Points[Index - 1].y);
	}
	if (Closed && Points.length > 2) {
		Sum += Math.hypot(Points[0].x - Points[Points.length - 1].x, Points[0].y - Points[Points.length - 1].y);
	}
	return Sum;
};

const areaOf = (Points) => {
	let Sum = 0;
	for (let Index = 0; Index < Points.length; Index += 1) {
		const Next = Points[(Index + 1) % Points.length];
		Sum += Points[Index].x * Next.y - Next.x * Points[Index].y;
	}
	return Math.abs(Sum) / 2;
};

const descriptorOf = (Genome) => {
	const Profile = Genome.profile ?? {};
	const Components = sceneOf(Genome, Genome.plan).components;
	const Open = Components.filter((Component) => Component.geometry.topology === "open").length;
	const Widths = Components.map((Component) => Component.stroke.width);
	const Ink = Components.reduce(
		(Sum, Component) => Sum + lengthOf(Component.centerline, Component.geometry.topology === "closed"),
		0,
	);
	const Area = Components.filter((Component) => Component.geometry.topology === "closed").reduce(
		(Sum, Component) => Sum + areaOf(Component.centerline),
		0,
	);
	const Pattern = ["ink", "accent", "accent2", "tint"]
		.map((Tone) => Components.filter((Component) => Component.material.tone === Tone).length)
		.sort((A, B) => B - A)
		.join("/");
	const Sides = 3 + Math.max(0, Math.min(4, Number(Profile.branching) || 0));
	const Rounds = 2 + Math.max(0, Math.min(4, Number(Profile.weight) || 0));
	const Plate =
		Profile.role === "governor" || Profile.role === "store"
			? "square"
			: Profile.role === "orchestrator"
				? "hexagon"
				: "disc";
	return {
		sides: Sides,
		rounds: Rounds,
		plate: Plate,
		symmetry: Genome.plan.order,
		components: Components.length,
		openShare: Math.round((Open / Components.length) * 100),
		pattern: Pattern,
		area: Math.round(Area),
		contrast: Math.round((Math.max(...Widths) / Math.min(...Widths)) * 10) / 10,
		ink: Math.round(Ink),
		dir: String(Genome.dir).replace(/^ets-/, ""),
	};
};

const report = (Label, Values) => {
	const Counts = new Map();
	for (const Value of Values) {
		Counts.set(Value, (Counts.get(Value) ?? 0) + 1);
	}
	const Rows = [...Counts.entries()].sort((A, B) => B[1] - A[1]);
	const Share = Math.round((Rows[0][1] / Values.length) * 100);
	const Top = Rows
		.slice(0, 5)
		.map(([Name, Count]) => `${Name} ${Count}`)
		.join(", ");
	console.log(`${Label}: ${Rows.length} classes; top ${Top} (max ${Share}%)`);
	return { classes: Rows.length, share: Share };
};

const Genomes = packages(Root).map((Entry) => genomeOf(Root, Entry));
const Descriptors = Genomes.map(descriptorOf);
const Results = [];
const record = (Name, Ok, Detail) => {
	Results.push({ Name, Ok, Detail });
	console.log(`${Ok ? "PASS" : "FAIL"}  ${Name}${Detail === "" ? "" : ` - ${Detail}`}`);
};

console.log(`Diversity report - ${Descriptors.length} icons\n`);

const Sides = report("seed sides", Descriptors.map((Entry) => Entry.sides));
const Rounds = report("decay rounds", Descriptors.map((Entry) => Entry.rounds));
const Plates = report("plates", Descriptors.map((Entry) => Entry.plate));
const Symmetry = report("symmetry", Descriptors.map((Entry) => Entry.symmetry));
const Components = report(
	"component buckets",
	Descriptors.map((Entry) => Math.min(48, Math.round(Entry.components / 6) * 6)),
);
const Patterns = report("tone patterns", Descriptors.map((Entry) => Entry.pattern));
const OpenShare = report(
	"open share",
	Descriptors.map((Entry) => (Entry.openShare < 20 ? "low" : Entry.openShare < 50 ? "mid" : "high")),
);

const Tuples = Descriptors.map(
	(Entry) =>
		`${Entry.sides}|${Entry.rounds}|${Entry.plate}|${Entry.symmetry}|${Entry.components}|${Entry.pattern}|${Math.round(Entry.ink / 95)}|${Math.round(Entry.area / 95)}`,
);
const Scenes = new Map();
for (const [Index, Entry] of Descriptors.entries()) {
	Scenes.set(Entry.dir, Tuples[Index]);
}
const Unique = new Set(Scenes.values()).size;
console.log(`\nunique descriptor tuples: ${Unique} of ${Scenes.size} package scenes`);

console.log("");
record("sides: at least 4 classes", Sides.classes >= 4, `${Sides.classes} classes`);
record("rounds: at least 3 classes", Rounds.classes >= 3, `${Rounds.classes} classes`);
record("plates: at least 2 classes", Plates.classes >= 2, `${Plates.classes} classes`);
record("symmetry: at least 3 orders", Symmetry.classes >= 3, `${Symmetry.classes} classes`);
record("components: at least 4 buckets", Components.classes >= 4, `${Components.classes} buckets`);
record("tone patterns: at least 3 patterns", Patterns.classes >= 3, `${Patterns.classes} patterns`);
record("tuples: at least 90% unique", Unique / Scenes.size >= 0.9, `${Unique} unique`);

const Failed = Results.filter((Result) => !Result.Ok);
console.log(`\n${Results.length - Failed.length} of ${Results.length} diversity checks pass`);
process.exit(Failed.length === 0 ? 0 : 1);
