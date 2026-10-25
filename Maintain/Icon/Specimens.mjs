// Specimens.mjs - the method specimen sheet (the milestone before another mass
// regeneration).
//
// Nine construction specimens, each shown as three diagnostic views - the
// centerline, the stroke envelope, and the footprint (envelope + contour) - and
// four deliberately different layered compositions. The sheet is an INSPECTION
// artefact: it exists to prove topology, terminals, joins, cutouts, clearance
// and the Effect footprint before the 102 icons are regenerated.
//
// The clearance rows are real numbers from Component.clearanceReport; a negative
// margin is a visible overlap.

import { buildComponent, clearanceReport, componentOf } from "./Component.mjs";
import { arc, circle, hook, needle, ray, zigzag } from "./Curve.mjs";
import { translatePoints } from "./Envelope.mjs";

const at = (Angle, Radius) => ({
	x: 50 + Radius * Math.cos((Angle * Math.PI) / 180),
	y: 50 + Radius * Math.sin((Angle * Math.PI) / 180),
});

const polyline = (Pairs) => Pairs.map(([Angle, Radius]) => at(Angle, Radius));

// --------------------------------------------------------------- the specimens

const SPECIMENS = [
	{
		id: "S1 miter corner",
		note: "open angular stroke, miter join, butt ends",
		spec: {
			centerline: polyline([
				[200, 30],
				[270, 12],
				[340, 30],
			]),
			geometry: { method: "open-angular", topology: "open" },
			stroke: { width: 3, join: "miter", start: "butt", end: "butt" },
		},
	},
	{
		id: "S2 bevel corner",
		note: "same stroke, bevel join",
		spec: {
			centerline: polyline([
				[200, 30],
				[270, 12],
				[340, 30],
			]),
			geometry: { method: "open-angular", topology: "open" },
			stroke: { width: 3, join: "bevel", start: "butt", end: "butt" },
		},
	},
	{
		id: "S3 butt curve",
		note: "open arc, butt terminals",
		spec: {
			centerline: arc({ Radius: 26, From: 200, To: 340, Samples: 16 }),
			geometry: { method: "open-curve", topology: "open" },
			stroke: { width: 2.6, join: "round", start: "butt", end: "butt" },
		},
	},
	{
		id: "S4 round curve",
		note: "same arc, round terminals",
		spec: {
			centerline: arc({ Radius: 26, From: 200, To: 340, Samples: 16 }),
			geometry: { method: "open-curve", topology: "open" },
			stroke: { width: 2.6, join: "round", start: "round", end: "round" },
		},
	},
	{
		id: "S5 tapered needle",
		note: "variable-width stroke (width profile), pointed both ends",
		spec: {
			centerline: polyline([
				[150, 12],
				[30, 34],
			]),
			geometry: { method: "needle", topology: "open" },
			stroke: { width: 5, widthProfile: "tapered", start: "butt", end: "butt" },
		},
	},
	{
		id: "S6 tight hook",
		note: "hooked stroke with a tight inner curve",
		spec: {
			centerline: hook({ Angle: 0, Radius: 26, Spread: 150, Samples: 18 }),
			geometry: { method: "hook", topology: "open" },
			stroke: { width: 2.6, join: "round", start: "round", end: "round" },
		},
	},
	{
		id: "S7 cutout ring",
		note: "closed contour with a real cutout (even-odd hole)",
		spec: {
			centerline: circle({ Radius: 28, Samples: 48 }),
			geometry: { method: "closed-ring", topology: "closed" },
			stroke: { width: 3, join: "round" },
			cutout: circle({ Radius: 12, Samples: 32 }),
		},
	},
	{
		id: "S8 adjacent clearance",
		note: "two outlined strokes at the minimum clearance (footprint test)",
		spec: [
			{
				centerline: translatePoints(
					arc({ Radius: 24, From: 200, To: 340, Samples: 14 }),
					0,
					-5,
				),
				geometry: { method: "open-curve", topology: "open" },
				stroke: { width: 2.4 },
				composition: { collisionGroup: "pair" },
			},
			{
				centerline: translatePoints(
					arc({ Radius: 24, From: 200, To: 340, Samples: 14 }),
					0,
					5,
				),
				geometry: { method: "open-curve", topology: "open" },
				stroke: { width: 2.4 },
				composition: { collisionGroup: "pair" },
			},
		],
	},
	{
		id: "S9 echo footprint",
		note: "Effect variant: the echo is part of the footprint",
		spec: [
			{
				centerline: polyline([
					[150, 12],
					[30, 34],
				]),
				geometry: { method: "needle", topology: "open" },
				stroke: { width: 2.4 },
				composition: { collisionGroup: "echo" },
			},
			{
				centerline: translatePoints(
					polyline([
						[150, 12],
						[30, 34],
					]),
					1.2,
					-1.2,
				),
				geometry: { method: "echo", topology: "open" },
				stroke: { width: 2.4 },
				composition: { collisionGroup: "echo", operation: "decorate" },
			},
		],
	},
];

const COMPOSITIONS = [
	{
		id: "C1 sparse angular",
		note: "three open angular strokes, four dots, large negative space",
		components: [
			{
				centerline: polyline([
					[210, 30],
					[270, 14],
					[330, 30],
				]),
				stroke: { width: 2.2, join: "miter" },
			},
			{
				centerline: translatePoints(
					polyline([
						[210, 30],
						[270, 14],
						[330, 30],
					]),
					0,
					26,
				),
				stroke: { width: 1.6, join: "miter" },
			},
			{
				centerline: translatePoints(
					polyline([
						[210, 30],
						[270, 14],
						[330, 30],
					]),
					0,
					-26,
				),
				stroke: { width: 1.6, join: "miter" },
			},
			{
				centerline: circle({ Radius: 1.4, Samples: 10 }),
				transform: { x: -22, y: 0 },
				stroke: { width: 1.2 },
			},
			{
				centerline: circle({ Radius: 1.4, Samples: 10 }),
				transform: { x: 22, y: 0 },
				stroke: { width: 1.2 },
			},
		],
	},
	{
		id: "C2 dense curved",
		note: "four concentric arcs plus a bead ring",
		components: [
			{
				centerline: circle({ Radius: 30, Samples: 40 }),
				geometry: { topology: "closed" },
				stroke: { width: 1.4 },
			},
			{
				centerline: circle({ Radius: 22, Samples: 36 }),
				geometry: { topology: "closed" },
				stroke: { width: 1.4 },
			},
			{
				centerline: circle({ Radius: 14, Samples: 32 }),
				geometry: { topology: "closed" },
				stroke: { width: 1.4 },
			},
			{
				centerline: circle({ Radius: 7, Samples: 24 }),
				geometry: { topology: "closed" },
				stroke: { width: 1.4 },
			},
		],
	},
	{
		id: "C3 asymmetric collage",
		note: "one large off-centre hook, a void diamond, small ticks",
		components: [
			{
				centerline: hook({ Angle: 0, Radius: 26, Spread: 150, Samples: 18 }),
				transform: { x: -16, y: -10, rotation: 12 },
				stroke: { width: 3, start: "round", end: "round" },
			},
			{
				centerline: circle({ Radius: 11, Samples: 28 }),
				transform: { x: 20, y: 18 },
				geometry: { topology: "closed" },
				stroke: { width: 1.6 },
			},
			{ centerline: ray({ Angle: 300, Inner: 26, Outer: 38 }), stroke: { width: 1.4 } },
			{ centerline: ray({ Angle: 330, Inner: 26, Outer: 38 }), stroke: { width: 1.4 } },
		],
	},
	{
		id: "C4 balanced radial",
		note: "eight rays, one ring, one core, mixed widths",
		components: [
			...Array.from({ length: 8 }, (_, Index) => ({
				centerline: ray({ Angle: Index * 45, Inner: 12, Outer: 30 }),
				stroke: { width: Index % 2 === 0 ? 2.4 : 1.2, start: "butt", end: "butt" },
			})),
			{
				centerline: circle({ Radius: 6, Samples: 24 }),
				geometry: { topology: "closed" },
				stroke: { width: 1.4 },
			},
		],
	},
];

// ------------------------------------------------------------------- rendering

const COLORS = { ink: "#1F1A17", accent: "#8A4B2F", accent2: "#4B3A6B", guide: "#9A8B7A" };

const pathOf = (Points, Close = false) =>
	`M${Points.map((Entry) => `${Math.round(Entry.x * 10) / 10},${Math.round(Entry.y * 10) / 10}`).join(" L")}${Close ? " Z" : ""}`;

/** The three diagnostic views of one component. */
const viewsOf = (Built) => {
	const Centerline = `<path d="${pathOf(Built.centerline, false)}" fill="none" stroke="${COLORS.ink}" stroke-width="0.9" stroke-dasharray="1.6 1.4"/>`;
	const Envelope = `<path d="${Built.envelope}" fill="${COLORS.accent}" fill-opacity="0.45" fill-rule="evenodd" stroke="${COLORS.ink}" stroke-width="0.5"/>`;
	const Footprint = `<path d="${Built.footprint}" fill="${COLORS.accent2}" fill-opacity="0.22" fill-rule="evenodd" stroke="${COLORS.accent2}" stroke-width="0.5" stroke-dasharray="2 1.5"/>`;
	const Cutout =
		Built.cutout === undefined
			? ""
			: `<path d="${pathOf(Built.cutout, true)}" fill="#F8E3B7" stroke="${COLORS.ink}" stroke-width="0.4" fill-rule="evenodd"/>`;
	return { centerline: Centerline, envelope: Envelope + Cutout, footprint: Footprint };
};

/** One SVG sheet: rows = specimens, columns = label + three diagnostic views. */
export const viewsSheet = () => {
	const Rows = [];
	const Report = [];
	for (const Specimen of SPECIMENS) {
		const Specs = Array.isArray(Specimen.spec) ? Specimen.spec : [Specimen.spec];
		const Built = Specs.map((Spec) => buildComponent({ ...Spec, id: Specimen.id }));
		const First = Built[0];
		const Views = viewsOf(First);
		const Extra =
			Specimen.id === "S8 adjacent clearance"
				? `<path d="${Built[1].envelope}" fill="${COLORS.accent}" fill-opacity="0.45" fill-rule="evenodd" stroke="${COLORS.ink}" stroke-width="0.5"/>`
				: Specimen.id === "S9 echo footprint"
					? `<path d="${Built[1].footprint}" fill="${COLORS.accent2}" fill-opacity="0.18" fill-rule="evenodd" stroke="${COLORS.accent2}" stroke-width="0.5" stroke-dasharray="2 1.5"/>`
					: "";
		if (Specs.length > 1) {
			Report.push(
				...clearanceReport(Built, 1.5).map((Row) => ({ specimen: Specimen.id, ...Row })),
			);
		}
		Rows.push({ id: Specimen.id, note: Specimen.note, views: Views, extra: Extra });
	}
	return { rows: Rows, report: Report };
};

/** One SVG sheet: the four compositions, each with its clearance verdict. */
export const compositionsSheet = () => {
	const Rows = [];
	const Report = [];
	for (const Composition of COMPOSITIONS) {
		const Built = Composition.components.map((Spec, Index) =>
			buildComponent({ ...Spec, id: `${Composition.id}-${Index + 1}` }),
		);
		const ReportRows = clearanceReport(Built, 1.5);
		Report.push(...ReportRows.map((Row) => ({ composition: Composition.id, ...Row })));
		Rows.push({
			id: Composition.id,
			note: Composition.note,
			built: Built,
			ok: ReportRows.every((Row) => Row.ok),
		});
	}
	return { rows: Rows, report: Report };
};

/** Serialize the specimens sheet as one SVG document. */
export const specimenSvg = () => {
	const { rows, report } = viewsSheet();
	const Panel = 96;
	const Label = 168;
	const RowHeight = Panel + 10;
	const Width = Label + Panel * 3 + 20;
	const Height = rows.length * RowHeight + 30;
	const Body = rows
		.map((Row, Index) => {
			const Y = 20 + Index * RowHeight;
			const Cells = ["centerline", "envelope", "footprint"]
				.map((View, Column) => {
					const X = Label + Column * Panel;
					const Inner = Row.views[View];
					return `<g transform="translate(${X},${Y})"><rect x="0" y="0" width="${Panel - 8}" height="${Panel - 8}" fill="none" stroke="${COLORS.guide}" stroke-width="0.4"/><g transform="scale(${(Panel - 12) / 100})">${Inner}${View === "envelope" || View === "footprint" ? Row.extra : ""}</g></g><text x="${X + 4}" y="${Height - 6}" font-family="Helvetica" font-size="6.5" fill="${COLORS.ink}">${Row.id}</text>`;
				})
				.join("\n");
			return `<text x="6" y="${Y + 14}" font-family="Helvetica" font-size="7" fill="${COLORS.ink}">${Row.id}</text><text x="6" y="${Y + 26}" font-family="Helvetica" font-size="5.5" fill="${COLORS.guide}">${Row.note}</text>${Cells}`;
		})
		.join("\n");
	const Failed = report.filter((Row) => !Row.ok);
	return {
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Width} ${Height}" width="${Width}" height="${Height}"><rect width="100%" height="100%" fill="#F8E3B7"/>${Body}</svg>`,
		report,
		failed: Failed,
	};
};

/** Serialize the compositions sheet as one SVG document. */
export const compositionSvg = () => {
	const { rows, report } = compositionsSheet();
	const Panel = 120;
	const Label = 150;
	const Width = Label + Panel * rows.length + 20;
	const Height = Panel + 30;
	const Body = rows
		.map((Row, Index) => {
			const X = Label + Index * Panel;
			const Inner = Row.built
				.map(
					(Built) =>
						`<path d="${Built.envelope}" fill="${COLORS.accent}" fill-opacity="0.5" fill-rule="evenodd" stroke="${COLORS.ink}" stroke-width="0.5"/>`,
				)
				.join("");
			return `<g transform="translate(${X},10)"><rect x="0" y="0" width="${Panel - 8}" height="${Panel - 8}" fill="none" stroke="${COLORS.guide}" stroke-width="0.4"/><g transform="scale(${(Panel - 12) / 100})">${Inner}</g></g>`;
		})
		.join("\n");
	const Failed = report.filter((Row) => !Row.ok);
	return {
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Width} ${Height}" width="${Width}" height="${Height}"><rect width="100%" height="100%" fill="#F8E3B7"/>${Body}</svg>`,
		report,
		failed: Failed,
	};
};
