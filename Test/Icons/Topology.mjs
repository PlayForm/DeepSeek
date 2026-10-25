#!/usr/bin/env node
//===============================================================================
// Topology.mjs - the per-method topology contract arbiter.
//===============================================================================
//
// A method declares what must stay true under parameter changes. This script
// checks every generated icon against its family's contract:
//
//   1. geometry is finite and inside the box
//   2. the family's required frame method is present
//   3. at least N closed components exist
//   4. the component count stays under the family's ceiling
//   5. no component centerline self-intersects
//
// The trap this avoids: a filled envelope is closed even when its source
// centerline is open, so counting Z commands would not test open-stroke
// variety. The contract is checked on centerlines, not on the envelope.
//
// Usage: node Test/Icons/Topology.mjs
//===============================================================================

import { fileURLToPath } from "node:url";

import { genomeOf, packages } from "../../Maintain/Icon/Index.mjs";
import { sceneOf } from "../../Maintain/Icon/Transliterate.mjs";

const Root = fileURLToPath(new URL("../../", import.meta.url));

const Contracts = {
	spikeStar: { frame: null, closed: 3, total: 50 },
	crossStar: { frame: null, closed: 6, total: 38 },
	chevronRing: { frame: null, closed: 3, total: 32 },
	crescentRing: { frame: null, closed: 3, total: 36 },
	teardropOrbit: { frame: null, closed: 3, total: 36 },
	rosette: { frame: null, closed: 3, total: 32 },
	quatrefoil: { frame: "square-frame", closed: 4, total: 36 },
	diamondLattice: { frame: "diamond-frame", closed: 4, total: 32 },
	knotSquare: { frame: "square-frame", closed: 4, total: 32 },
	trellisKnot: { frame: "square-frame", closed: 4, total: 32 },
	scallopRing: { frame: "scallop-frame", closed: 4, total: 28 },
	octagonStar: { frame: "octagon-frame", closed: 3, total: 32 },
	divisionTile: { frame: "square-frame", closed: 4, total: 58 },
	isometricTiles: { frame: "isometric-base", closed: 3, total: 32 },
};

const cross = (A, B, C) => (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);

const crosses = (A, B, C, D) => {
	const First = cross(A, B, C);
	const Second = cross(A, B, D);
	const Third = cross(C, D, A);
	const Fourth = cross(C, D, B);
	return (
		((First > 0 && Second < 0) || (First < 0 && Second > 0)) &&
		((Third > 0 && Fourth < 0) || (Third < 0 && Fourth > 0))
	);
};

const selfIntersects = (Points, Closed) => {
	const Count = Points.length;
	const Segments = Closed ? Count : Count - 1;
	for (let Left = 0; Left < Segments; Left += 1) {
		const LeftNext = (Left + 1) % Count;
		for (let Right = Left + 1; Right < Segments; Right += 1) {
			const RightNext = (Right + 1) % Count;
			if (LeftNext === Right || RightNext === Left) {
				continue;
			}
			if (Closed && Left === 0 && Right === Segments - 1) {
				continue;
			}
			if (crosses(Points[Left], Points[LeftNext], Points[Right], Points[RightNext])) {
				return `${Left}/${Right}`;
			}
		}
	}
	return null;
};

const Problems = [];
const check = (Genome) => {
	const Scene = sceneOf(Genome, Genome.plan);
	const Contract = Contracts[Genome.plan.family];
	const Components = Scene.components;
	const Closed = Components.filter((Component) => Component.geometry.topology === "closed").length;
	const Methods = new Set(Components.map((Component) => Component.geometry.method));
	const Add = (Message) => Problems.push(`${Genome.dir}: ${Message}`);

	if (Contract === undefined) {
		Add(`no topology contract for family ${Genome.plan.family}`);
		return;
	}
	if (Components.length > Contract.total) {
		Add(`${Components.length} components over the ${Contract.total} ceiling`);
	}
	if (Contract.frame !== null && !Methods.has(Contract.frame)) {
		Add(`missing required frame method ${Contract.frame}`);
	}
	if (Closed < Contract.closed) {
		Add(`${Closed} closed components under the ${Contract.closed} floor`);
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
		const Crossing = selfIntersects(Points, Component.geometry.topology === "closed");
		if (Crossing !== null) {
			Add(`component ${Component.id} self-intersects at segment pair ${Crossing}`);
		}
	}
};

const Genomes = packages(Root).map((Entry) => genomeOf(Root, Entry));
for (const Genome of Genomes) {
	check(Genome);
}

const Families = new Set(Genomes.map((Genome) => Genome.plan.family));
const Covered = [...Families].filter((Family) => Contracts[Family] !== undefined).length;
console.log(`topology: ${Genomes.length} icons, ${Families.size} families, ${Covered} contracted`);

if (Problems.length === 0) {
	console.log("PASS  topology: every icon meets its family contract");
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
