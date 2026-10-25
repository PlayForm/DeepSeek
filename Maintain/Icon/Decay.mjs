// Decay.mjs - the degenerative geometry engine.
//
// An icon is not assembled from motifs. It is the residue of a form that has
// been decaying: a seed polygon is eroded, warped, cracked, perforated and
// fragmented for a number of rounds. The profile of the package decides the
// seed and the decay schedule, so the residue carries the package's meaning.
//
// The engine is pure: same profile and seed, same residue.

import { offsetPolyline } from "./Envelope.mjs";
import { digest, stream } from "./Prng.mjs";

const CENTRE = 50;
const RADIANS = Math.PI / 180;

const at = (Angle, Radius) => ({
	x: CENTRE + Radius * Math.cos(Angle * RADIANS),
	y: CENTRE + Radius * Math.sin(Angle * RADIANS),
});

const polygon = (Sides, Radius, Phase) => {
	const Points = [];
	for (let Index = 0; Index < Sides; Index += 1) {
		Points.push(at(Phase + (Index * 360) / Sides, Radius));
	}
	return Points;
};

const ring = (Radius, Samples = 28, Phase = 0) => {
	const Points = [];
	for (let Index = 0; Index < Samples; Index += 1) {
		Points.push(at(Phase + (Index * 360) / Samples, Radius));
	}
	return Points;
};

const inset = (Points, Distance) => offsetPolyline(Points, -Math.abs(Distance), true, "round");

const warp = (Points, Amount, Random) =>
	Points.map((Point) => ({
		x: Point.x + (Random.float() * 2 - 1) * Amount,
		y: Point.y + (Random.float() * 2 - 1) * Amount,
	}));

const crack = (Angle, HalfWidth, Inner, Outer) => [
	at(Angle - HalfWidth, Inner),
	at(Angle - HalfWidth, Outer),
	at(Angle + HalfWidth, Outer),
	at(Angle + HalfWidth, Inner),
];

const hole = (Angle, Radius, Size) => {
	const Centre = at(Angle, Radius);
	const Points = [];
	for (let Index = 0; Index < 16; Index += 1) {
		const Turn = (Index * 360) / 16;
		Points.push({
			x: Centre.x + Size * Math.cos(Turn * RADIANS),
			y: Centre.y + Size * Math.sin(Turn * RADIANS),
		});
	}
	return Points;
};

const debris = (Angle, Radius, Size) => [
	at(Angle - Size, Radius),
	at(Angle, Radius + Size),
	at(Angle + Size, Radius),
];

export const decayOf = (Profile, Seed) => {
	const Random = stream(digest(`${Seed}|decay`));
	const Branching = Math.max(0, Math.min(4, Number(Profile.branching) || 0));
	const Containment = Math.max(0, Math.min(4, Number(Profile.containment) || 0));
	const Weight = Math.max(0, Math.min(4, Number(Profile.weight) || 0));
	const Stateful = Profile.stateful === true;
	const Streaming = Profile.streaming === true;

	const Sides = 3 + Branching;
	const Radius = 26 + Containment * 4;
	const Rounds = 2 + Weight;
	const Phase = Streaming ? 0 : Random.pick([0, 15, 30, 45]);
	const Spiky =
		Profile.role === "renderer" ||
		Profile.role === "analyzer" ||
		Profile.role === "interceptor";

	const Clamp = (Point) => ({
		x: Math.max(3, Math.min(97, Point.x)),
		y: Math.max(3, Math.min(97, Point.y)),
	});
	let Shape = polygon(Sides, Radius, Phase);
	if (Spiky) {
		const Star = [];
		for (let Index = 0; Index < Sides * 2; Index += 1) {
			Star.push(
				at(Phase + (Index * 360) / (Sides * 2), Index % 2 === 0 ? Radius : Radius * 0.55),
			);
		}
		Shape = Star;
	}
	const Cutouts = [];
	for (let Round = 0; Round < Rounds; Round += 1) {
		Shape = inset(Shape, 1.2 + Round * 0.6);
		Shape = warp(Shape, 0.8 + Round * 0.3, Random);
		Shape = Shape.map(Clamp);
		Cutouts.push(crack(Phase + Round * 60 + Random.float() * 40, 0.8 + Round * 0.3, 6, 46));
		if (Round % 2 === 0) {
			Cutouts.push(
				hole(Phase + Random.float() * 360, 18 + Round * 3, 2.4 + Random.float() * 2),
			);
		}
	}
	if (Stateful) {
		Cutouts.push(hole(0, 0, 4.2));
	}

	const Fragments = [];
	const Debris = 2 + Branching;
	for (let Index = 0; Index < Debris; Index += 1) {
		Fragments.push({
			key: `debris-${Index}`,
			points: debris(
				Random.float() * 360,
				Radius + 6 + Random.float() * 8,
				1.6 + Random.float() * 2.4,
			).map(Clamp),
			tone: Index % 2 === 0 ? "accent2" : "accent",
			depth: 20 + Index,
		});
	}

	const Plate =
		Profile.role === "governor" || Profile.role === "store"
			? polygon(4, 44, 45)
			: Profile.role === "orchestrator"
				? polygon(6, 44, 0)
				: ring(44, 40, 22.5);

	return {
		shape: { key: "residue", points: Shape, cutout: Cutouts, tone: "ink", depth: 10 },
		fragments: Fragments,
		plate: { key: "plate", points: Plate, tone: "tint", depth: 0 },
		core: { key: "core", points: ring(2.6, 10), tone: "accent", depth: 30 },
		seed: { sides: Sides, radius: Radius, rounds: Rounds },
	};
};
