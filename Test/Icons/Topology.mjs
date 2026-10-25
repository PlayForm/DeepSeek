#!/usr/bin/env node
//===============================================================================
// Topology.mjs - the topology contract arbiter (degenerative scene).
//===============================================================================
//
// The scene is now a decayed residue plus semantic accents, so the contract is
// generic: finite coordinates inside the box, at least four closed faces, a
// bounded component count, and a valid stroke width. Self-intersection is
// allowed by design - the residue is decayed geometry.
//
// Usage: node Test/Icons/Topology.mjs

import { fileURLToPath } from "node:url";

import { genomeOf, packages } from "../../Maintain/Icon/Index.mjs";
import { sceneOf } from "../../Maintain/Icon/Transliterate.mjs";

const Root = fileURLToPath(new URL("../../", import.meta.url));
const Floor = 4;
const Ceiling = 120;
const Problems = [];

const check = (Genome) => {
	const Scene = sceneOf(Genome, Genome.plan);
	const Components = Scene.components;
	const Closed = Components.filter((Component) => Component.geometry.topology === "closed").length;
	const Add = (Message) => Problems.push(`${Genome.dir}: ${Message}`);

	if (Components.length > Ceiling) {
		Add(`${Components.length} components over the ${Ceiling} ceiling`);
	}
	if (Closed < Floor) {
		Add(`${Closed} closed components under the ${Floor} floor`);
	}
	for (const Component of Components) {
		const Points = Component.centerline;
		if (!Array.isArray(Points) || Points.length < 2) {
			Add(`component ${Component.id} has ${Points?.length ?? 0} points`);
			continue;
		}
		for (const Point of Points) {
			if (!Number.isFinite(Point.x) || !Number.isFinite(Point.y)) {
				Add(`component ${Component.id} has a non-finite point`);
				break;
			}
			if (Point.x < -2 || Point.x > 102 || Point.y < -2 || Point.y > 102) {
				Add(`component ${Component.id} leaves the box at ${Point.x},${Point.y}`);
				break;
			}
		}
		if (!Number.isFinite(Component.stroke.width) || Component.stroke.width <= 0) {
			Add(`component ${Component.id} has width ${Component.stroke.width}`);
		}
	}
};

for (const Entry of packages(Root)) {
	check(genomeOf(Root, Entry));
}

console.log(`topology: ${packages(Root).length} icons checked`);

if (Problems.length === 0) {
	console.log("PASS  topology: every icon meets the contract");
	console.log("\n1 of 1 topology checks pass");
	process.exit(0);
}
for (const Problem of Problems.slice(0, 40)) {
	console.log(`FAIL  ${Problem}`);
}
if (Problems.length > 40) {
	console.log(`... ${Problems.length - 40} more`);
}
console.log(`\n0 of 1 topology checks pass (${Problems.length} problems)`);
process.exit(1);
