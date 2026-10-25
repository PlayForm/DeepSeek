// Motif.mjs - the ornamental motif library.
//
// Twelve construction grammars. Each family returns the layered parts of one
// motif inside the 100x100 box, centred on (50,50). A family is the icon's
// construction method; the order passed in is its symmetry; the layers
// (frame, body, core, detail) are where Transliterate.mjs attaches the code
// semantics.
//
// A part is a plain record: key, points, closed, width, join, method, layer,
// tone. No rendering happens here.

const CENTRE = 50;
const RADIANS = Math.PI / 180;

const at = (Angle, Radius) => ({
	x: CENTRE + Radius * Math.cos(Angle * RADIANS),
	y: CENTRE + Radius * Math.sin(Angle * RADIANS),
});

const around = (X, Y, Radius, Angle) => ({
	x: X + Radius * Math.cos(Angle * RADIANS),
	y: Y + Radius * Math.sin(Angle * RADIANS),
});

const ring = (Radius, Samples = 40, Phase = 0) => {
	const Points = [];
	for (let Index = 0; Index < Samples; Index += 1) {
		Points.push(at(Phase + (Index * 360) / Samples, Radius));
	}
	return Points;
};

const polygon = (Count, Radius, Phase = 0) => {
	const Points = [];
	for (let Index = 0; Index < Count; Index += 1) {
		Points.push(at(Phase + (Index * 360) / Count, Radius));
	}
	return Points;
};

const circleAt = (Angle, Radius, Size, Samples = 24) => {
	const Centre = at(Angle, Radius);
	const Points = [];
	for (let Index = 0; Index < Samples; Index += 1) {
		Points.push(around(Centre.x, Centre.y, Size, (Index * 360) / Samples));
	}
	return Points;
};

const star = ({ Order, Inner, Outer, Phase = -90, Bow = 0.3, Samples = 2 }) => {
	const Points = [];
	const Count = Order * 2;
	const Step = 360 / Count;
	for (let Index = 0; Index < Count; Index += 1) {
		const Angle = Phase + Index * Step;
		const Radius = Index % 2 === 0 ? Outer : Inner;
		Points.push(at(Angle, Radius));
		const NextRadius = Index % 2 === 0 ? Inner : Outer;
		for (let Sub = 1; Sub < Samples; Sub += 1) {
			const Ratio = Sub / Samples;
			const BowIn = Math.sin(Math.PI * Ratio) * Bow * Math.min(Radius, NextRadius);
			Points.push(at(Angle + Step * Ratio, Radius + (NextRadius - Radius) * Ratio - BowIn));
		}
	}
	return Points;
};

const scallop = ({ Radius, Lobes, Depth, Samples = 72 }) => {
	const Points = [];
	for (let Index = 0; Index < Samples; Index += 1) {
		const Angle = (Index * 360) / Samples;
		const Bump = Depth * Math.sin(Lobes * Angle * RADIANS);
		Points.push(at(Angle, Radius + Bump));
	}
	return Points;
};

const petal = ({ Angle, Radius, Length, Width, Samples = 20 }) => {
	const Centre = at(Angle, Radius + Length / 2);
	const Cos = Math.cos(Angle * RADIANS);
	const Sin = Math.sin(Angle * RADIANS);
	const Points = [];
	for (let Index = 0; Index < Samples; Index += 1) {
		const Turn = (Index * 360) / Samples;
		const LocalX = (Length / 2) * Math.cos(Turn * RADIANS);
		const LocalY = (Width / 2) * Math.sin(Turn * RADIANS);
		Points.push({
			x: Centre.x + LocalX * Cos - LocalY * Sin,
			y: Centre.y + LocalX * Sin + LocalY * Cos,
		});
	}
	return Points;
};

const teardrop = ({ Angle, Radius, Length, Width, Samples = 12 }) => {
	const Base = at(Angle, Radius);
	const Points = [];
	for (let Index = 0; Index <= Samples; Index += 1) {
		Points.push(around(Base.x, Base.y, Width / 2, Angle + 90 + (180 * Index) / Samples));
	}
	Points.push(at(Angle, Radius + Length));
	return Points;
};

const crescent = ({ Angle, Radius, Size, Spread = 150, Samples = 10 }) => {
	const Outer = at(Angle, Radius);
	const Inner = at(Angle, Radius - Size * 0.4);
	const Points = [];
	for (let Index = 0; Index <= Samples; Index += 1) {
		Points.push(around(Outer.x, Outer.y, Size, Angle - Spread / 2 + (Spread * Index) / Samples));
	}
	for (let Index = Samples; Index >= 0; Index -= 1) {
		Points.push(
			around(Inner.x, Inner.y, Size * 0.78, Angle - Spread / 2 + (Spread * Index) / Samples),
		);
	}
	return Points;
};

const spike = ({ Angle, Inner, Outer, HalfWidth }) => {
	const Spread = Math.atan2(HalfWidth, Inner) / RADIANS;
	return [at(Angle - Spread, Inner), at(Angle, Outer), at(Angle + Spread, Inner)];
};

const zigzagRing = ({ Radius, Teeth, Depth, Phase = -90 }) => {
	const Points = [];
	for (let Index = 0; Index < Teeth * 2; Index += 1) {
		const Angle = Phase + (Index * 360) / (Teeth * 2);
		Points.push(at(Angle, Index % 2 === 0 ? Radius + Depth : Radius - Depth));
	}
	return Points;
};

const loop = (Angle, Radius, Size) => circleAt(Angle, Radius, Size, 12);

const tick = (Angle, Radius, Length) => [
	at(Angle, Radius - Length / 2),
	at(Angle, Radius + Length / 2),
];

const wedge = (Angle, Inner, Outer, Spread) => [
	at(Angle - Spread, Inner),
	at(Angle - Spread, Outer),
	at(Angle + Spread, Outer),
	at(Angle + Spread, Inner),
];

const spiralAt = (X, Y, Radius, Turns, Samples = 14) => {
	const Points = [];
	for (let Index = 0; Index <= Samples; Index += 1) {
		const Ratio = Index / Samples;
		const Angle = Ratio * 360 * Turns;
		const Shrink = Radius * (1 - 0.85 * Ratio);
		Points.push(around(X, Y, Shrink, Angle));
	}
	return Points;
};

export const Ornament = {
	at,
	around,
	ring,
	polygon,
	circleAt,
	star,
	scallop,
	petal,
	teardrop,
	crescent,
	spike,
	zigzagRing,
	loop,
	tick,
	wedge,
	spiralAt,
};

const spikeStar = ({ Order }) => {
	const Parts = [
		{
			key: "star",
			points: star({ Order, Inner: 16, Outer: 43, Bow: 0.3 }),
			closed: true,
			width: 1.7,
			join: "miter",
			method: "star-ring",
			layer: "body",
		},
		{
			key: "core",
			points: ring(9, 20),
			closed: true,
			width: 1.2,
			method: "core-ring",
			layer: "core",
			tone: "accent",
		},
	];
	for (let Index = 0; Index < Order; Index += 1) {
		Parts.push({
			key: `bead-${Index}`,
			points: circleAt(-90 + (Index * 360) / Order, 12, 1.2, 6),
			closed: true,
			width: 0.7,
			method: "bead",
			layer: "detail",
			tone: "accent2",
		});
	}
	return Parts;
};

const quatrefoil = () => {
	const Parts = [];
	for (let Index = 0; Index < 4; Index += 1) {
		Parts.push({
			key: `lobe-${Index}`,
			points: circleAt(45 + Index * 90, 19, 14, 28),
			closed: true,
			width: 1.5,
			method: "lobe",
			layer: "body",
		});
	}
	Parts.push({
		key: "frame",
		points: polygon(4, 42, 45),
		closed: true,
		width: 1.4,
		join: "miter",
		method: "square-frame",
		layer: "frame",
	});
	Parts.push({
		key: "core",
		points: polygon(4, 12, 0),
		closed: true,
		width: 1.2,
		method: "diamond-core",
		layer: "core",
		tone: "accent",
	});
	return Parts;
};

const diamondLattice = () => {
	const Parts = [
		{
			key: "frame",
			points: polygon(4, 44, 0),
			closed: true,
			width: 1.6,
			join: "miter",
			method: "diamond-frame",
			layer: "frame",
		},
		{
			key: "inner",
			points: polygon(4, 30, 0),
			closed: true,
			width: 1.2,
			method: "diamond-inner",
			layer: "body",
		},
		{
			key: "core",
			points: polygon(4, 14, 0),
			closed: true,
			width: 1.1,
			method: "diamond-core",
			layer: "core",
			tone: "accent",
		},
	];
	for (let Index = 0; Index < 4; Index += 1) {
		Parts.push({
			key: `spoke-${Index}`,
			points: [at(Index * 90, 30), at(Index * 90, 44)],
			closed: false,
			width: 0.9,
			method: "lattice-spoke",
			layer: "detail",
		});
	}
	return Parts;
};

const knotSquare = () => {
	const Parts = [
		{
			key: "frame",
			points: polygon(4, 38, 45),
			closed: true,
			width: 1.5,
			join: "miter",
			method: "square-frame",
			layer: "frame",
		},
		{
			key: "inner",
			points: polygon(4, 26, 45),
			closed: true,
			width: 1.1,
			method: "square-inner",
			layer: "body",
		},
		{
			key: "core",
			points: polygon(4, 11, 0),
			closed: true,
			width: 1.1,
			method: "diamond-core",
			layer: "core",
			tone: "accent",
		},
	];
	for (let Index = 0; Index < 4; Index += 1) {
		Parts.push({
			key: `loop-${Index}`,
			points: circleAt(45 + Index * 90, 38, 4.5, 16),
			closed: true,
			width: 1.1,
			method: "corner-loop",
			layer: "detail",
			tone: "accent2",
		});
	}
	return Parts;
};

const crescentRing = ({ Order }) => {
	const Parts = [
		{
			key: "ring",
			points: ring(26, 40),
			closed: true,
			width: 1.6,
			method: "ring-body",
			layer: "body",
		},
		{
			key: "core",
			points: ring(8, 20),
			closed: true,
			width: 1.2,
			method: "core-ring",
			layer: "core",
			tone: "accent",
		},
	];
	for (let Index = 0; Index < Order; Index += 1) {
		Parts.push({
			key: `moon-${Index}`,
			points: crescent({ Angle: (Index * 360) / Order, Radius: 35, Size: 5.5 }),
			closed: true,
			width: 0.9,
			method: "crescent",
			layer: "detail",
			tone: "accent2",
		});
	}
	return Parts;
};

const crossStar = () => {
	const Parts = [];
	for (let Index = 0; Index < 4; Index += 1) {
		Parts.push({
			key: `arm-${Index}`,
			points: spike({ Angle: Index * 90, Inner: 7, Outer: 45, HalfWidth: 5 }),
			closed: true,
			width: 1.1,
			join: "miter",
			method: "spike-arm",
			layer: "body",
		});
	}
	for (let Index = 0; Index < 4; Index += 1) {
		Parts.push({
			key: `ray-${Index}`,
			points: spike({ Angle: 45 + Index * 90, Inner: 7, Outer: 27, HalfWidth: 3 }),
			closed: true,
			width: 0.9,
			join: "miter",
			method: "spike-ray",
			layer: "detail",
			tone: "accent2",
		});
	}
	Parts.push({
		key: "core",
		points: polygon(4, 8, 45),
		closed: true,
		width: 1.1,
		method: "square-core",
		layer: "core",
		tone: "accent",
	});
	return Parts;
};

const scallopRing = ({ Order }) => {
	const Lobes = Order <= 4 ? 8 : Order * 2;
	return [
		{
			key: "frame",
			points: scallop({ Radius: 38, Lobes, Depth: 5, Samples: 72 }),
			closed: true,
			width: 1.6,
			method: "scallop-frame",
			layer: "frame",
		},
		{
			key: "inner",
			points: polygon(4, 26, 45),
			closed: true,
			width: 1.1,
			method: "square-inner",
			layer: "body",
		},
		{
			key: "core",
			points: polygon(4, 12, 45),
			closed: true,
			width: 1.1,
			method: "square-core",
			layer: "core",
			tone: "accent",
		},
	];
};

const rosette = ({ Order }) => {
	const Parts = [];
	for (let Index = 0; Index < Order; Index += 1) {
		Parts.push({
			key: `petal-${Index}`,
			points: petal({
				Angle: (Index * 360) / Order,
				Radius: 13,
				Length: 19,
				Width: 11,
			}),
			closed: true,
			width: 1.2,
			method: "petal",
			layer: "body",
			tone: Index % 2 === 0 ? "ink" : "accent",
		});
	}
	Parts.push({
		key: "core",
		points: ring(6.5, 16),
		closed: true,
		width: 1.1,
		method: "core-ring",
		layer: "core",
		tone: "accent2",
	});
	Parts.push({
		key: "halo",
		points: ring(42, 48),
		closed: true,
		width: 0.8,
		method: "halo",
		layer: "frame",
		tone: "accent2",
	});
	return Parts;
};

const octagonStar = ({ Order }) => {
	return [
		{
			key: "frame",
			points: polygon(8, 43, 22.5),
			closed: true,
			width: 1.5,
			join: "miter",
			method: "octagon-frame",
			layer: "frame",
		},
		{
			key: "star",
			points: star({ Order: Order <= 4 ? 8 : Order, Inner: 19, Outer: 32, Bow: 0.2 }),
			closed: true,
			width: 1.1,
			method: "star-inner",
			layer: "body",
		},
		{
			key: "core",
			points: ring(7, 16),
			closed: true,
			width: 1.0,
			method: "core-ring",
			layer: "core",
			tone: "accent",
		},
	];
};

const teardropOrbit = ({ Order }) => {
	const Parts = [
		{
			key: "ring",
			points: ring(30, 40),
			closed: true,
			width: 1.2,
			method: "ring-body",
			layer: "body",
			tone: "accent",
		},
		{
			key: "core",
			points: ring(9, 20),
			closed: true,
			width: 1.3,
			method: "core-ring",
			layer: "core",
		},
	];
	for (let Index = 0; Index < Order; Index += 1) {
		Parts.push({
			key: `drop-${Index}`,
			points: teardrop({ Angle: (Index * 360) / Order, Radius: 31, Length: 12, Width: 7 }),
			closed: true,
			width: 1.0,
			method: "teardrop",
			layer: "detail",
			tone: "accent2",
		});
	}
	return Parts;
};

const chevronRing = ({ Order }) => {
	return [
		{
			key: "chevron",
			points: zigzagRing({ Radius: 36, Teeth: Order, Depth: 5 }),
			closed: true,
			width: 1.5,
			join: "miter",
			method: "chevron-ring",
			layer: "body",
		},
		{
			key: "inner",
			points: ring(20, 32),
			closed: true,
			width: 1.0,
			method: "ring-inner",
			layer: "body",
		},
		{
			key: "core",
			points: polygon(4, 8, 0),
			closed: true,
			width: 1.0,
			method: "diamond-core",
			layer: "core",
			tone: "accent",
		},
	];
};

const trellisKnot = () => {
	return [
		{
			key: "frame",
			points: polygon(4, 42, 45),
			closed: true,
			width: 1.5,
			join: "miter",
			method: "square-frame",
			layer: "frame",
		},
		{
			key: "inner",
			points: polygon(4, 28, 45),
			closed: true,
			width: 1.1,
			method: "square-inner",
			layer: "body",
		},
		{
			key: "diagonal-a",
			points: [at(45, 28), at(225, 28)],
			closed: false,
			width: 0.9,
			method: "trellis",
			layer: "detail",
		},
		{
			key: "diagonal-b",
			points: [at(135, 28), at(315, 28)],
			closed: false,
			width: 0.9,
			method: "trellis",
			layer: "detail",
		},
		{
			key: "core",
			points: polygon(4, 11, 0),
			closed: true,
			width: 1.0,
			method: "diamond-core",
			layer: "core",
			tone: "accent",
		},
	];
};

const Families = {
	spikeStar,
	quatrefoil,
	diamondLattice,
	knotSquare,
	crescentRing,
	crossStar,
	scallopRing,
	rosette,
	octagonStar,
	teardropOrbit,
	chevronRing,
	trellisKnot,
};

const ByKind = {
	hook: ["spikeStar", "chevronRing", "crossStar", "crescentRing", "teardropOrbit", "octagonStar"],
	plugin: ["diamondLattice", "knotSquare", "trellisKnot", "scallopRing", "quatrefoil", "octagonStar"],
	client: ["quatrefoil", "rosette", "scallopRing", "diamondLattice", "trellisKnot"],
	lib: ["crescentRing", "rosette", "octagonStar", "knotSquare", "spikeStar", "teardropOrbit"],
};

export const familyFor = (Kind, Random) => {
	const Candidates = ByKind[Kind] ?? ByKind.plugin;
	return Candidates[Random.next() % Candidates.length];
};

export const familyOf = (Name, Options) => (Families[Name] ?? Families.spikeStar)(Options);

export const familiesOf = () => Object.keys(Families);
