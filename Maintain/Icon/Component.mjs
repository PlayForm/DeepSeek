// Component.mjs - the placed-component model (the brief's Component type).
//
// An icon is NOT a bag of paths grouped by colour. It is a scene of COMPONENTS:
// each carries its layer, its semantic meaning (the plugin feature it encodes),
// its construction method and topology, its placement transform, its stroke
// specification (width profile, terminals, join, contour), and its composition
// rule (paint / subtract / clip, collision group, minimum clearance).
//
// Components stay separate through validation and composition; merging paths is
// an export optimisation that happens last, if at all.

import { clearanceOf, envelopeOf, footprintOf, rotatePoints, scalePoints, translatePoints } from "./Envelope.mjs";

const defaults = {
	layer: "body",
	semantic: { feature: "unknown", role: "support" },
	geometry: { method: "open-stroke", topology: "open", parameters: {} },
	transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
	stroke: { width: 1.5, widthProfile: "constant", start: "butt", end: "butt", join: "miter", outlineWidth: 0.7 },
	composition: { operation: "paint", collisionGroup: "body", minimumClearance: 1.5 },
	material: { tone: "ink" },
};

/** Build a component from a spec; the spec's centerline is required. */
export const componentOf = (Spec) => ({
	...defaults,
	...Spec,
	semantic: { ...defaults.semantic, ...(Spec.semantic ?? {}) },
	geometry: { ...defaults.geometry, ...(Spec.geometry ?? {}) },
	transform: { ...defaults.transform, ...(Spec.transform ?? {}) },
	stroke: { ...defaults.stroke, ...(Spec.stroke ?? {}) },
	composition: { ...defaults.composition, ...(Spec.composition ?? {}) },
	material: { ...defaults.material, ...(Spec.material ?? {}) },
});

/** Apply the placement transform to a centerline. */
export const place = (Points, Transform) => {
	let Result = Points;
	if (Transform.scaleX !== 1 || Transform.scaleY !== 1) {
		Result = scalePoints(Result, Transform.scaleX, Transform.scaleY);
	}
	if (Transform.rotation !== 0) {
		Result = rotatePoints(Result, Transform.rotation);
	}
	if (Transform.x !== 0 || Transform.y !== 0) {
		Result = translatePoints(Result, Transform.x, Transform.y);
	}
	return Result;
};

/** The width profile of a component as a per-point array. */
const widthsOf = (Component) => {
	const Points = Component.centerline;
	if (Component.stroke.widthProfile === "tapered") {
		const Peak = Component.stroke.width;
		return Points.map((_, Index) => {
			const Ratio = Points.length === 1 ? 0.5 : Index / (Points.length - 1);
			return Math.max(0.2, Peak * Math.sin(Math.PI * Ratio) + 0.4);
		});
	}
	return Points.map(() => Component.stroke.width);
};

/** Build the placed geometry: centerline, envelope, footprint, contour. */
export const buildComponent = (Spec) => {
	const Component = componentOf(Spec);
	const Points = place(Component.centerline, Component.transform);
	const Widths = widthsOf({ ...Component, centerline: Points });
	const Options = {
		join: Component.stroke.join,
		startCap: Component.stroke.start,
		endCap: Component.stroke.end,
		contour: Component.stroke.outlineWidth,
	};
	const Closed = Component.geometry.topology === "closed";
	const Envelope = envelopeOf(Points, Widths, Closed, Options);
	const Footprint = footprintOf(Points, Widths, Closed, Options);
	const FootprintPoints = FootprintPointsOf(Points, Widths, Closed, Options);
	return { ...Component, centerline: Points, widths: Widths, envelope: Envelope, footprint: Footprint, footprintPoints: FootprintPoints };
};

/** The footprint polygons (outer, and inner for closed) used by clearance. */
export const FootprintPointsOf = (Points, Widths, Closed, Options = {}) => {
	const Contour = Options.contour ?? 0.7;
	const Grown = (Array.isArray(Widths) ? Widths : [Widths]).map((Value) => Value + Contour * 2);
	const Halves = (Array.isArray(Grown) ? Grown : Points.map(() => Grown)).map((Value) => Value / 2);
	const Outer = Points.map((Entry, Index) => {
		const Previous = Points[(Index - 1 + Points.length) % Points.length];
		const Next = Points[(Index + 1) % Points.length];
		const Forward = { x: Next.x - Entry.x, y: Next.y - Entry.y };
		const Backward = { x: Entry.x - Previous.x, y: Entry.y - Previous.y };
		const Use = Closed ? { x: Forward.x + Backward.x, y: Forward.y + Backward.y } : Forward;
		const Scale = Math.hypot(Use.x, Use.y) || 1;
		const Normal = { x: -Use.y / Scale, y: Use.x / Scale };
		return { x: Entry.x + Normal.x * Halves[Index], y: Entry.y + Normal.y * Halves[Index] };
	});
	return [Outer];
};

/** Pairwise clearance over a scene, using the footprints. */
export const clearanceReport = (Components, Gap = 1.5) => {
	const Rows = [];
	for (let Index = 0; Index < Components.length; Index += 1) {
		for (let Other = Index + 1; Other < Components.length; Other += 1) {
			const A = Components[Index];
			const B = Components[Other];
			const WidthA = A.widths?.length ? Math.max(...A.widths) : A.stroke.width;
			const WidthB = B.widths?.length ? Math.max(...B.widths) : B.stroke.width;
			const Result = clearanceOf(
				{ points: A.centerline, width: WidthA, contour: A.stroke.outlineWidth },
				{ points: B.centerline, width: WidthB, contour: B.stroke.outlineWidth },
				Gap,
			);
			const Decoration = A.composition.operation === "decorate" || B.composition.operation === "decorate";
			Rows.push({
				a: A.id,
				b: B.id,
				actual: Math.round(Result.actual * 100) / 100,
				required: Math.round(Result.required * 100) / 100,
				margin: Math.round(Result.margin * 100) / 100,
				ok: Result.ok || Decoration,
				decoration: Decoration,
			});
		}
	}
	return Rows;
};
