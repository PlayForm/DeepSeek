// Curve.mjs - the function layer. Every stroke in an icon is SAMPLED from a
// parametric function, never assembled from fixed primitives: a superellipse, a
// lobed ring, a wavy ring, a dot ring. Each sampler returns a point list in the
// 100 x 100 canvas (centre 50,50), quantized to 0.01, and every closed sampler
// is non-self-intersecting by construction - the collage rule (Compose.mjs)
// depends on that.
//
// The angle convention matches Geometry.mjs: 0 degrees is +x, angles increase
// clockwise on screen.

const CENTRE = 50;

/** 0.01 quantization, trimmed - the only number format the renderer sees. */
const number = (Value) => {
	const Rounded = Math.round(Value);
	return Object.is(Rounded, -0) ? "0" : String(Rounded);
};

/** A point at an angle (degrees) and a radius from the centre. */
const at = (Angle, Radius) => {
	const Radians = (Angle * Math.PI) / 180;
	return { x: CENTRE + Radius * Math.cos(Radians), y: CENTRE + Radius * Math.sin(Radians) };
};

/** "M x,y L x,y ..." with an optional close. */
export const pathOf = (Points, Close = true) =>
	Points.map(
		(Point, Index) => `${Index === 0 ? "M" : "L"}${number(Point.x)},${number(Point.y)}`,
	).join(" ") + (Close ? " Z" : "");

/** A superellipse: n = 2 is a circle, n = 4 a squircle, n -> inf a square. */
export const superellipse = ({ Radius, Power = 4, Samples = 96, Phase = 0 }) => {
	const Points = [];
	for (let Index = 0; Index < Samples; Index += 1) {
		const Angle = Phase + (Index * 360) / Samples;
		const Radians = (Angle * Math.PI) / 180;
		const Cos = Math.cos(Radians);
		const Sin = Math.sin(Radians);
		const X = Math.sign(Cos) * Math.pow(Math.abs(Cos), 2 / Power) * Radius;
		const Y = Math.sign(Sin) * Math.pow(Math.abs(Sin), 2 / Power) * Radius;
		Points.push({ x: CENTRE + X, y: CENTRE + Y });
	}
	return Points;
};

/**
 * A lobed ring: r = Inner + Amplitude * |cos(Lobes * angle / 2)| ^ Power.
 * Star-shaped about the centre, so it never self-intersects and never reaches
 * the centre - the body of every grammar is a lobed ring, not a set of
 * overlapping petals.
 */
export const lobedRing = ({ Lobes, Inner, Amplitude, Power = 2, Samples = 96, Phase = 0 }) => {
	const Points = [];
	for (let Index = 0; Index < Samples; Index += 1) {
		const Angle = Phase + (Index * 360) / Samples;
		const Radians = (Angle * Math.PI) / 180;
		const Radius =
			Inner + Amplitude * Math.pow(Math.abs(Math.cos((Lobes * Radians) / 2)), Power);
		Points.push({
			x: CENTRE + Radius * Math.cos(Radians),
			y: CENTRE + Radius * Math.sin(Radians),
		});
	}
	return Points;
};

/** A wavy ring: r = Radius + Amplitude * cos(Lobes * angle). Amplitude < Radius. */
export const waveRing = ({ Radius, Amplitude = 1.5, Lobes = 8, Samples = 288, Phase = 0 }) => {
	const Points = [];
	for (let Index = 0; Index < Samples; Index += 1) {
		const Angle = Phase + (Index * 360) / Samples;
		const Radians = (Angle * Math.PI) / 180;
		const R = Radius + Amplitude * Math.cos(Lobes * Radians);
		Points.push({ x: CENTRE + R * Math.cos(Radians), y: CENTRE + R * Math.sin(Radians) });
	}
	return Points;
};

/** A circle sampled from the same angle convention (so the outline pass is uniform). */
export const circle = ({ Radius, Samples = 64, Phase = 0 }) =>
	superellipse({ Radius, Power: 2, Samples, Phase });

/** A partial arc, as an open polyline. */
export const arc = ({ Radius, From, To, Samples = 48 }) => {
	const Points = [];
	for (let Index = 0; Index <= Samples; Index += 1) {
		const Angle = From + ((To - From) * Index) / Samples;
		Points.push(at(Angle, Radius));
	}
	return Points;
};

/** A ring of dots: each dot is its own closed circle, placed on a common radius. */
export const dotRing = ({ Radius, Count, Dot = 1.4, OffsetAngle = 0 }) => {
	const Points = [];
	for (let Index = 0; Index < Count; Index += 1) {
		const Angle = OffsetAngle + (Index * 360) / Count;
		const Centre = at(Angle, Radius);
		const Radians = (Angle * Math.PI) / 180;
		const Ring = [];
		for (let Step = 0; Step < 8; Step += 1) {
			const Turn = (Step * 2 * Math.PI) / 16;
			Ring.push({ x: Centre.x + Dot * Math.cos(Turn), y: Centre.y + Dot * Math.sin(Turn) });
		}
		Points.push(Ring);
	}
	return Points;
};

/** A ring of short ticks, each a two-point stroke placed on a common radius. */
export const tickRing = ({ Radius, Count, Length = 2.5, OffsetAngle = 0 }) => {
	const Ticks = [];
	for (let Index = 0; Index < Count; Index += 1) {
		const Angle = OffsetAngle + (Index * 360) / Count;
		Ticks.push([at(Angle, Radius), at(Angle, Radius + Length)]);
	}
	return Ticks;
};

/** A phyllotaxis spiral of dots, confined to an annulus (no overlap with the body). */
export const phyllotaxis = ({ Count, Inner, Outer, Dot = 1.2 }) => {
	const Golden = Math.PI * (3 - Math.sqrt(5));
	const Points = [];
	for (let Index = 0; Index < Count; Index += 1) {
		const Ratio = Count === 1 ? 1 : Index / (Count - 1);
		const Radius = Inner + (Outer - Inner) * Math.sqrt(Ratio);
		const Angle = (Index * Golden * 180) / Math.PI;
		const Centre = at(Angle, Radius);
		const Ring = [];
		for (let Step = 0; Step < 8; Step += 1) {
			const Turn = (Step * 2 * Math.PI) / 12;
			Ring.push({ x: Centre.x + Dot * Math.cos(Turn), y: Centre.y + Dot * Math.sin(Turn) });
		}
		Points.push(Ring);
	}
	return Points;
};

// ---------------------------------------------------------------------------
// OPEN samplers. The reference sheet is full of strokes that STOP: rays with a
// sharp tip, hooks that curl into nothing, needles, cusps, open arcs. A closed
// ring cannot express any of that, so the open vocabulary lives here and the
// composer mixes it with the closed one per zone and per package.
// ---------------------------------------------------------------------------

/** A ray: an open spike from the inner radius to a sharp tip, optionally bent. */
export const ray = ({ Angle, Inner, Outer, Bend = 0, Samples = 12 }) => {
	const Points = [];
	for (let Index = 0; Index <= Samples; Index += 1) {
		const Ratio = Index / Samples;
		const Radius = Inner + (Outer - Inner) * Ratio;
		const Swing = Bend * Math.sin(Math.PI * Ratio);
		Points.push(at(Angle + Swing, Radius));
	}
	return Points;
};

/** A needle: a straight open stroke with a sharp end. */
export const needle = ({ Angle, Inner, Outer }) => [at(Angle, Inner), at(Angle, Outer)];

/** A hook: an open S that curls into the centre and stops. */
export const hook = ({ Angle, Radius, Curl = 0.55, Direction = 1, Spread = 72, Samples = 18 }) => {
	const Points = [];
	for (let Index = 0; Index <= Samples; Index += 1) {
		const Ratio = Index / Samples;
		const Swing = Direction * Spread * Ratio;
		const R = Radius * (1 - Curl * Ratio);
		Points.push(at(Angle + Swing, R));
	}
	return Points;
};

/** A spiral: an open stroke that winds inward and stops at the centre. */
export const spiral = ({ Angle, Radius, Turns = 1.4, Samples = 40, Direction = 1 }) => {
	const Points = [];
	for (let Index = 0; Index <= Samples; Index += 1) {
		const Ratio = Index / Samples;
		Points.push(at(Angle + Direction * 360 * Turns * Ratio, Radius * (1 - 0.85 * Ratio)));
	}
	return Points;
};

/** A cusp: two arcs meeting at a sharp point, open at the base. */
export const cusp = ({ Angle, Radius, Spread = 26, Rise = 4, Samples = 10 }) => {
	const Left = [];
	const Right = [];
	for (let Index = 0; Index <= Samples; Index += 1) {
		const Ratio = Index / Samples;
		Left.push(at(Angle - Spread * (1 - Ratio), Radius + Rise * Math.sin(Math.PI * Ratio)));
		Right.push(at(Angle + Spread * (1 - Ratio), Radius + Rise * Math.sin(Math.PI * Ratio)));
	}
	return [...Left, ...Right.reverse()];
};

/** An open zigzag between two radii. */
export const zigzag = ({ Radius, Teeth, Depth = 3, From = 0, To = 360 }) => {
	const Points = [];
	for (let Index = 0; Index <= Teeth * 2; Index += 1) {
		const Ratio = Index / (Teeth * 2);
		const Angle = From + (To - From) * Ratio;
		Points.push(at(Angle, Index % 2 === 0 ? Radius : Radius + Depth));
	}
	return Points;
};

/** A tapered spike as a FILLED polygon: wide at the base, a point at the tip. */
export const taper = ({ Angle, Inner, Outer, HalfWidth }) => [
	at(Angle - HalfWidth, Inner),
	at(Angle, Outer),
	at(Angle + HalfWidth, Inner),
	at(Angle, Inner + (Outer - Inner) * 0.35),
];
