#!/usr/bin/env node
// Diversity.mjs - the collection-level diversity arbiter.
//
// Different SVG hashes do not prove different visual identities. This script
// records a descriptor per icon - motif family, symmetry, silhouette class,
// topology, component count, tone pattern, stroke contrast, ink length - and
// reports the distribution. A narrow generator cannot hide behind a long
// method list.
//
// Twins (a Classic/EffectTS pair) share a scene on purpose, so uniqueness is
// measured over package scenes, not over the 102 documents.
//
// Usage: node Test/Icons/Diversity.mjs

import { fileURLToPath } from "node:url";

import { genomeOf, packages } from "../../Maintain/Icon/Index.mjs";
import { sceneOf } from "../../Maintain/Icon/Transliterate.mjs";

const Root = fileURLToPath(new URL("../../", import.meta.url));

const Silhouette = {
	spikeStar: "star",
	crossStar: "cross",
	chevronRing: "chevron",
	crescentRing: "ring",
	teardropOrbit: "ring",
	rosette: "rosette",
	quatrefoil: "quatrefoil",
	diamondLattice: "diamond",
	knotSquare: "square",
	trellisKnot: "square",
	scallopRing: "scallop",
	octagonStar: "octagon",
	divisionTile: "grid",
	isometricTiles: "hexagon",
};

const lengthOf = (Points, Closed) => {
	let Sum = 0;
	for (let Index = 1; Index < Points.length; Index += 1) {
		Sum += Math.hypot(
			Points[Index].x - Points[Index - 1].x,
			Points[Index].y - Points[Index - 1].y,
		);
	}
	if (Closed && Points.length > 2) {
		Sum += Math.hypot(
			Points[0].x - Points[Points.length - 1].x,
			Points[0].y - Points[Points.length - 1].y,
		);
	}
	return Sum;
};

const descriptorOf = (Genome) => {
	const Components = sceneOf(Genome, Genome.plan).components;
	const Open = Components.filter((Component) => Component.geometry.topology === "open").length;
	const Widths = Components.map((Component) => Component.stroke.width);
	const Ink = Components.reduce(
		(Sum, Component) =>
			Sum + lengthOf(Component.centerline, Component.geometry.topology === "closed"),
		0,
	);
	const Pattern = ["ink", "accent", "accent2"]
		.map((Tone) => Components.filter((Component) => Component.material.tone === Tone).length)
		.sort((A, B) => B - A)
		.join("/");
	return {
		family: Genome.plan.family,
		symmetry: Genome.plan.order,
		phase: Genome.plan.phase ?? 0,
		silhouette: Silhouette[Genome.plan.family] ?? "other",
		topology: Open === 0 ? "closed" : Open === Components.length ? "open" : "mixed",
		components: Components.length,
		pattern: Pattern,
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

const Family = report("families", Descriptors.map((Entry) => Entry.family));
const SilhouetteReport = report("silhouettes", Descriptors.map((Entry) => Entry.silhouette));
const Symmetry = report("symmetry", Descriptors.map((Entry) => Entry.symmetry));
const Topology = report("topology", Descriptors.map((Entry) => Entry.topology));
const Components = report(
	"component buckets",
	Descriptors.map((Entry) => Math.min(24, Math.round(Entry.components / 4) * 4)),
);
const Patterns = report("tone patterns", Descriptors.map((Entry) => Entry.pattern));
const Contrast = report(
	"stroke contrast",
	Descriptors.map((Entry) =>
		Entry.contrast >= 2.5 ? "high" : Entry.contrast >= 1.8 ? "medium" : "low",
	),
);

const Tuples = Descriptors.map(
	(Entry) =>
		`${Entry.family}|${Entry.symmetry}|${Entry.phase}|${Entry.silhouette}|${Entry.topology}|${Math.round(Entry.components / 4)}|${Entry.pattern}|${Math.round(Entry.ink / 200)}`,
);
const Scenes = new Map();
for (const [Index, Entry] of Descriptors.entries()) {
	Scenes.set(Entry.dir, Tuples[Index]);
}
const Unique = new Set(Scenes.values()).size;
const Duplicate = Scenes.size - Unique;

console.log(
	`\nunique descriptor tuples: ${Unique} of ${Scenes.size} package scenes (${Duplicate} duplicate)`,
);
const Ink = Descriptors.map((Entry) => Entry.ink).sort((A, B) => A - B);
console.log(`ink length: min ${Ink[0]}, median ${Ink[Math.floor(Ink.length / 2)]}, max ${Ink[Ink.length - 1]}`);

console.log("");
record("families: at least 10 used", Family.classes >= 10, `${Family.classes} classes`);
record("families: no family above 35%", Family.share <= 35, `${Family.share}%`);
record("silhouettes: at least 7 used", SilhouetteReport.classes >= 7, `${SilhouetteReport.classes} classes`);
record("silhouettes: no silhouette above 40%", SilhouetteReport.share <= 40, `${SilhouetteReport.share}%`);
record("symmetry: at least 3 orders", Symmetry.classes >= 3, `${Symmetry.classes} classes`);
record("topology: both open and closed present", Topology.classes >= 2, `${Topology.classes} classes`);
record("components: at least 4 buckets", Components.classes >= 4, `${Components.classes} buckets`);
record("tone patterns: at least 3 patterns", Patterns.classes >= 3, `${Patterns.classes} patterns`);
record("contrast: both high and low present", Contrast.classes >= 2, `${Contrast.classes} classes`);
record("tuples: at least 90% unique", Unique / Scenes.size >= 0.9, `${Unique} unique`);

const Failed = Results.filter((Result) => !Result.Ok);
console.log(`\n${Results.length - Failed.length} of ${Results.length} diversity checks pass`);
process.exit(Failed.length === 0 ? 0 : 1);
