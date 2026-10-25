import { createHash } from "node:crypto";

export const digest = (Text) => createHash("sha256").update(Text, "utf8").digest("hex");

export const seedOf = (Parts) => digest(Parts.join("|"));

const Quantize = (Value, Step) => Math.round(Value / Step) * Step;

export const stream = (Seed) => {
	let State = Number.parseInt(String(Seed ?? "").slice(0, 8), 16) >>> 0;
	if (State === 0) {
		State = 1;
	}
	const next = () => {
		State = (State ^ (State << 13)) >>> 0;
		State = (State ^ (State >>> 17)) >>> 0;
		State = (State ^ (State << 5)) >>> 0;
		return State;
	};
	const float = () => next() / 4294967296;
	return {
		next,
		float,
		range: (Min, Max) => Min + float() * (Max - Min),
		jitter: (Base, Amplitude, Quantum = 0.25) =>
			Quantize(Base + (float() * 2 - 1) * Amplitude, Quantum),
		pick: (Items) => Items[next() % Items.length],
	};
};
