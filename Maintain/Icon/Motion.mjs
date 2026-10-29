// Motion.mjs - the motion vocabulary.
//
// An icon is not a still image on the site: every element moves the way the
// feature it encodes behaves. A tool bead orbits the service it drives, a seam
// tick fires in its recorded order, a state nest breathes with the state it
// holds, and the plate holds still unless the package streams.
//
// The motion is written into the asset as one prefixed style block, so the file
// stays self-contained: no script, no external reference, and the media query
// leaves a reader who prefers reduced motion on the still drawing. Every class
// and keyframe carries the package directory, so several inlined icons on one
// page never share a rule.
//
// The module is pure and deterministic: the seed sets the clock, so one package
// always moves at the same speed.

/** The order the style block writes the motions in. */
export const Order = ["orbit", "counter", "breathe", "fire", "twinkle", "trace"];

/** The motion one component carries, from the feature its id names. */
export const motionOf = (Component, Profile) => {
	const Id = String(Component.id ?? "");
	const Method = String(Component.geometry?.method ?? "");
	switch (true) {
		case Id.startsWith("debris"):
			return "twinkle";
		case Id === "residue":
			return Profile.streaming === true ? "breathe" : null;
		case Id === "plate":
		case Id === "core":
		case Method === "medallion":
		case Method === "state-nest":
			return "breathe";
		case Method === "gate-loop":
		case Method === "seam-tick":
		case Method === "transform-cusp":
			return "fire";
		case Method === "tool-bead":
			return "orbit";
		case Method === "injection-ring":
		case Method === "evolution-ring":
			return "breathe";
		case Method === "ledger-bead":
		case Method === "detail-bead":
			return "counter";
		default:
			return null;
	}
};

/** The clock of one package: seeded durations and one shared phase offset. */
export const clockOf = (Genome) => {
	const Seed = Number.parseInt(String(Genome.seed ?? "").slice(0, 8), 16) || 1;
	const Pick = (Base, Span, Shift) => Base + ((Seed >>> Shift) % Span);
	return {
		orbit: `${Pick(16, 8, 0)}s`,
		counter: `${Pick(20, 9, 3)}s`,
		breathe: `${Pick(5, 4, 6)}s`,
		fire: `${(Pick(26, 7, 9) / 10).toFixed(1)}s`,
		twinkle: `${Pick(6, 7, 12)}s`,
		trace: `${Pick(4, 3, 15)}s`,
		delay: `-${Pick(1, 7, 5)}s`,
		stagger: 0.18,
	};
};

/** The staggered delay of the nth firing element. */
export const offsetOf = (Clock, Index) =>
	`-${(Math.abs(Number.parseFloat(Clock.delay)) + Index * Clock.stagger).toFixed(2)}s`;

/** The scoped style block: only the motions the scene uses, all prefixed. */
export const styleOf = (Prefix, Clock, Used) => {
	const Rules = [];
	if (Used.includes("orbit")) {
		Rules.push(
			`\t\t.${Prefix}-orbit { animation: ${Prefix}-orbit ${Clock.orbit} linear ${Clock.delay} infinite; }`,
			`\t\t@keyframes ${Prefix}-orbit { to { transform: rotate(360deg); } }`,
		);
	}
	if (Used.includes("counter")) {
		Rules.push(
			`\t\t.${Prefix}-counter { animation: ${Prefix}-counter ${Clock.counter} linear ${Clock.delay} infinite; }`,
			`\t\t@keyframes ${Prefix}-counter { to { transform: rotate(-360deg); } }`,
		);
	}
	if (Used.includes("breathe")) {
		Rules.push(
			`\t\t.${Prefix}-breathe { animation: ${Prefix}-breathe ${Clock.breathe} ease-in-out ${Clock.delay} infinite; }`,
			`\t\t@keyframes ${Prefix}-breathe { 50% { transform: scale(1.06); opacity: 0.85; } }`,
		);
	}
	if (Used.includes("fire")) {
		Rules.push(
			`\t\t.${Prefix}-fire { animation: ${Prefix}-fire ${Clock.fire} ease-in-out infinite; }`,
			`\t\t@keyframes ${Prefix}-fire { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }`,
		);
	}
	if (Used.includes("twinkle")) {
		Rules.push(
			`\t\t.${Prefix}-twinkle { animation: ${Prefix}-twinkle ${Clock.twinkle} ease-in-out ${Clock.delay} infinite; }`,
			`\t\t@keyframes ${Prefix}-twinkle { 0%, 100% { transform: scale(0.94); opacity: 0.4; } 50% { transform: scale(1.06); opacity: 1; } }`,
		);
	}
	if (Used.includes("trace")) {
		Rules.push(
			`\t\t.${Prefix}-trace { animation: ${Prefix}-trace ${Clock.trace} ease-in-out ${Clock.delay} infinite; }`,
			`\t\t@keyframes ${Prefix}-trace { 0%, 100% { transform: translate(0, 0); opacity: 1; } 50% { transform: translate(1.4px, -1.4px); opacity: 0.35; } }`,
		);
	}
	return `\t<style>\n\t\t@media (prefers-reduced-motion: no-preference) {\n\t\t\t.${Prefix}-scene * { transform-box: view-box; transform-origin: 50% 50%; }\n${Rules.join("\n")}\n\t\t}\n\t</style>`;
};
