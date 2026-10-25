// Photograph.mjs - degenerative photography with one feature set per layer.
//
// The icon is exposed like a photograph that is decaying, but the exposure is
// split into radial LAYERS, and each layer carries a different feature of the
// package: the state band, the event band, the tool band, the injection band,
// and the feature bleed outside. A layer that the package does not have falls
// back to the ink layer, so the ring of colours around an icon is a reading of
// which features it actually owns.

import { decayOf } from "./Decay.mjs";
import { digest, stream } from "./Prng.mjs";

const inside = (Point, Polygon) => {
	let Hit = false;
	for (let Index = 0, Other = Polygon.length - 1; Index < Polygon.length; Other = Index, Index += 1) {
		const Left = Polygon[Index];
		const Right = Polygon[Other];
		if (
			Left.y > Point.y !== Right.y > Point.y &&
			Point.x < ((Right.x - Left.x) * (Point.y - Left.y)) / (Right.y - Left.y) + Left.x
		) {
			Hit = !Hit;
		}
	}
	return Hit;
};

const Exposure = {
	compaction: 1.1,
	context: 0.9,
	session: 1,
	"session-query": 1.2,
	workspace: 1,
	guard: 1.3,
	preset: 0.8,
	client: 1,
	skill: 0.9,
	web: 1,
	tools: 1,
	schedule: 0.9,
	goal: 1,
	subagent: 1,
	workflow: 1,
	credentials: 1,
	interaction: 1,
	core: 1,
};

const Bands = [
	{ limit: 16, key: "state", token: "state", scale: 1.2 },
	{ limit: 26, key: "events", token: "gate", scale: 1 },
	{ limit: 34, key: "tools", token: "tool", scale: 0.9 },
	{ limit: 41, key: "injections", token: "injection", scale: 1.1 },
];

export const photographOf = (Profile, Tokens, Effect, Seed) => {
	const Residue = decayOf(Profile, Seed);
	const Shape = Residue.shape.points;
	const Random = stream(digest(`${Seed}|photograph`));
	const Feature = typeof Profile.feature === "string" ? Profile.feature : "core";
	const Bias = Exposure[Feature] ?? 1;
	const Weight = Math.max(0, Math.min(4, Number(Profile.weight) || 0));
	const Branching = Math.max(0, Math.min(4, Number(Profile.branching) || 0));
	const Step = 7 - Math.min(2, Weight * 0.5);
	const Grain = 0.5 + Branching * 0.35;
	const Pattern = Effect?.pattern ?? "base";
	const EffectTone = Effect?.tone ?? "feature";
	const EffectExposure = Effect?.exposure ?? 1;
	const Owned = Object.fromEntries(
		Bands.map((Band) => [Band.key, (Tokens[Band.token] ?? []).length > 0]),
	);
	const Dots = [];
	for (let Y = Step / 2; Y < 100; Y += Step) {
		for (let X = Step / 2; X < 100; X += Step) {
			const Covered = inside({ x: X, y: Y }, Shape);
			const Distance = Math.hypot(X - 50, Y - 50);
			const Radial = Math.max(0, 1 - Distance / 52);
			const Noise = Random.float();
			const Row = Math.round(Y / Step);
			const Column = Math.round(X / Step);
			if (Pattern === "scan" && Row % 2 === 1) {
				continue;
			}
			if (Pattern === "lattice" && (Row + Column) % 2 === 1) {
				continue;
			}
			if (Pattern === "frame" && Distance < 34) {
				continue;
			}
			if (Pattern === "line" && Math.abs(Y - 70) > 3.5) {
				continue;
			}
			if (Pattern === "anchor" && Distance > 12) {
				continue;
			}
			if (Pattern === "gate" && !Covered) {
				continue;
			}
			const Trail = Pattern === "trail" ? Math.sin(Y / 8) * 2.4 : 0;
			const Band = Bands.find((Entry) => Distance < Entry.limit);
			const OwnedBand = Band !== undefined && Owned[Band.key];
			const Base = Covered ? 0.46 : 0.16;
			const Scale = OwnedBand ? Band.scale : 1;
			const Pulse = Pattern === "pulse" ? 1 + 0.25 * Math.sin(Distance / 5) : 1;
			const Anchor = Pattern === "anchor" ? 1.7 : 1;
			const Radius =
				Step *
				Base *
				Scale *
				Pulse *
				Anchor *
				(0.55 + Radial * 0.7) *
				Bias *
				EffectExposure *
				(0.65 + Noise * Grain * 0.6);
			if (Radius < 0.45) {
				continue;
			}
			let Tone;
			if (Covered) {
				Tone = Noise > 0.9 ? "tint" : OwnedBand ? Band.key : EffectTone;
			} else {
				Tone = "feature";
			}
			Dots.push({
				x: Math.round((X + Trail + (Random.float() - 0.5) * 1.4) * 10) / 10,
				y: Math.round((Y + (Random.float() - 0.5) * 1.4) * 10) / 10,
				r: Math.round(Radius * 10) / 10,
				tone: Tone,
				layer: OwnedBand ? Band.key : "ink",
			});
			if (Pattern === "echo" || Pattern === "merge" || Pattern === "fork") {
				Dots.push({
					x: Math.round((X + 3 + (Random.float() - 0.5) * 1.2) * 10) / 10,
					y: Math.round((Y + 3 + (Random.float() - 0.5) * 1.2) * 10) / 10,
					r: Math.round(Radius * 0.8 * 10) / 10,
					tone: EffectTone,
					layer: "echo",
				});
			}
		}
	}
	return { dots: Dots, owned: Owned, effect: Effect?.effect ?? "persistence" };
};
