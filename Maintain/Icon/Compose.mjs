// Compose.mjs - stack the matrix cells into the collage.
//
// The matrix (Matrix.mjs) decides WHICH method each layer uses; this module turns
// each cell into parts with the measured parameters, in stack order (outer ->
// inner), so the layers congregate into one icon. Zone disjointness is enforced
// here by the radii: every method is called with radii inside its own annulus.

import { matrixOf } from "./Matrix.mjs";
import * as M from "./Method.mjs";

const spread = (Count, Phase) =>
	Array.from({ length: Count }, (_, Index) => Phase + (Index * 360) / Count);
const asParts = (Value) => (Array.isArray(Value) ? Value : [Value]);

/** The rim annulus: 44 .. 47. */
const rimCell = (Cell, Plan) => {
	const Phase = Plan.jitter.phase;
	switch (Cell.method) {
		case "scallop":
			return M.scallopEdge({ Radius: 45.5, Lobes: Plan.order });
		case "chevron":
			return M.chevronEdge({ Radius: 45, Teeth: Plan.order * 2, Depth: 2 });
		case "interlace":
			return M.interlaceBand({
				Count: Math.min(8, Plan.order),
				Radius: 45.5,
				Width: 1.5,
				Phase,
			});
		case "double":
			return M.doubleRing({ Radius: 45, Inset: 2.5, Power: 2 });
		case "frame":
		default:
			return M.squareFrame({
				Half: 44,
				Power: Plan.grammar === "interlace-tile" ? 5 : 3,
				Phase: 45,
			});
	}
};

/** The evolution annulus: 32.5 .. 37 (closed rings - history is settled). */
const evolutionCell = (Cell) => {
	const Parts = [];
	for (let Index = 1; Index <= Math.max(0, Cell.level); Index += 1) {
		Parts.push(
			...asParts(M.closedRing({ Radius: 32.5 + Index * 1.5, Power: 2, tone: "accent" })),
		);
	}
	return Parts;
};

/** The detail annulus: the bead band at r 32. */
const detailCell = (Cell, Plan) => {
	const Count = [0, 6, 10, 14][Cell.level] ?? 0;
	if (Count === 0) {
		return [];
	}
	if (Cell.method === "ticks") {
		return M.tickOrbit({
			Radius: 32,
			Count,
			Length: 1.5,
			Phase: Plan.jitter.phase / 4,
			tone: "accent2",
		});
	}
	return M.beadString({
		Radius: 32,
		Count,
		Dot: 0.55,
		Phase: Plan.jitter.phase / 4,
		tone: "accent2",
	});
};

/** The body annulus: 9 .. 31. */
const bodyCell = (Cell, Plan) => {
	const Radii = spread(Plan.order, Plan.jitter.phase);
	switch (Cell.method) {
		case "cusp":
			return Radii.map((Angle) => M.cuspPair({ Angle, Radius: 22, Spread: 20, Rise: 5 }));
		case "ray":
			return Radii.map((Angle) =>
				M.openRay({ Angle, Inner: 12, Outer: 29, Bend: Plan.variant === 1 ? 4 : 0 }),
			);
		case "hook":
			return Radii.slice(0, Math.min(4, Plan.order)).map((Angle, Index) =>
				M.openHook({
					Angle,
					Radius: 29,
					Spread: 44,
					Curl: 0.45,
					Direction: Index % 2 === 0 ? 1 : -1,
				}),
			);
		case "spiral":
			return Radii.slice(0, 2).map((Angle, Index) =>
				M.openSpiral({
					Angle,
					Radius: 29,
					Turns: 0.6,
					Direction: Index % 2 === 0 ? 1 : -1,
				}),
			);
		case "needle":
			return Radii.map((Angle) => M.openNeedle({ Angle, Inner: 12, Outer: 30 }));
		case "taper":
			return Radii.map((Angle) =>
				M.taperSpike({ Angle, Inner: 10, Outer: 30, HalfWidth: 5 }),
			);
		case "quadrant":
			return Radii.slice(0, 4).flatMap((Angle) =>
				M.quadrantBlock({ Angle, Inner: 12, Outer: 27, Inset: 4 }),
			);
		case "web":
			return M.webLattice({
				Spokes: Plan.order,
				Inner: 12,
				Outer: 28,
				Radii: Plan.variant === 2 ? [20] : [],
			});
		case "void":
			return M.voidDiamond({ Half: 26, Thickness: 6 });
		case "ring":
		default:
			return M.closedRing({
				Inner: 10,
				Amplitude: 19,
				Lobes: Plan.order,
				Power: Plan.variant === 1 ? 3 : 4,
				Phase: Plan.jitter.phase,
			});
	}
};

/** The orbit annulus: 41 .. 43. */
const orbitCell = (Cell, Plan) => {
	const Count = [0, 4, 8, 12][Cell.level] ?? 0;
	if (Count === 0 || Cell.method === "none") {
		return [];
	}
	if (Cell.method === "ticks") {
		return M.tickOrbit({ Radius: 41, Count, Length: 2.5, Phase: Plan.jitter.phase / 2 });
	}
	if (Cell.method === "needles") {
		return spread(Count, Plan.jitter.phase / 2).map((Angle) =>
			M.openNeedle({ Angle, Inner: 39, Outer: 44, tone: "accent2" }),
		);
	}
	return M.dotOrbit({ Radius: 42, Count, Dot: 1.3, Phase: Plan.jitter.phase / 2 });
};

/** The core: r <= 7. */
const coreCell = (Cell, Plan) => {
	switch (Cell.method) {
		case "void":
			return M.voidDiamond({ Half: 6, Thickness: 2.5 });
		case "wedge":
			return M.filledWedge({ Angle: Plan.jitter.phase, Inner: 2, Outer: 7, Spread: 40 });
		case "ring":
		default:
			return M.closedRing({ Radius: 5, Power: Plan.variant === 1 ? 4 : 2 });
	}
};

/** The whole collage: one cell per layer, stacked outer -> inner. */
export const collageOf = (Genome, Plan) => {
	const Matrix = matrixOf(Genome, Plan);
	const Parts = [];
	for (const Cell of Matrix.layers) {
		switch (Cell.layer) {
			case "rim":
				Parts.push(...asParts(rimCell(Cell, Plan)));
				break;
			case "evolution":
				Parts.push(...evolutionCell(Cell));
				break;
			case "detail":
				Parts.push(...detailCell(Cell, Plan));
				break;
			case "body":
				Parts.push(...asParts(bodyCell(Cell, Plan)));
				break;
			case "orbit":
				Parts.push(...asParts(orbitCell(Cell, Plan)));
				break;
			case "core":
			default:
				Parts.push(...asParts(coreCell(Cell, Plan)));
				break;
		}
	}
	if (Plan.fill === "tint") {
		const Body = Parts.find((Entry) => Entry.tone === "ink");
		if (Body !== undefined) {
			Body.fill = "tint";
		}
	}
	return Parts;
};

/** The matrix of one package, exposed for the ledger and the checks. */
export { matrixOf };
