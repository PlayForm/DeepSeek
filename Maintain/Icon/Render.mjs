import {
	core,
	diamondFrame,
	interlace,
	orbit,
	petal,
	quadrant,
	ring,
	scallopFrame,
	scroll,
	spike,
	squareFrame,
	teardrop,
	web,
	wovenFrame,
} from "./Geometry.mjs";
import { palettesOf } from "./Palette.mjs";

const TONES = { ink: 0, accent: 1, tint: 2 };

const bodyOf = (Plan) => {
	const Parts = [];
	const Step = 360 / Plan.order;
	switch (Plan.grammar) {
		case "interlace-tile": {
			if (Plan.variant === 0) {
				Parts.push({
					d: interlace({ Count: 4, Radius: 30, Width: 6, Phase: Plan.jitter.phase }),
					tone: "ink",
				});
				for (let Index = 0; Index < 4; Index += 1) {
					Parts.push({
						d: quadrant({ Angle: 45 + Index * 90, Inner: 12, Outer: 30, Inset: 4 }),
						tone: "accent",
					});
				}
			} else if (Plan.variant === 1) {
				Parts.push({
					d: interlace({ Count: 8, Radius: 28, Width: 4, Phase: Plan.jitter.phase }),
					tone: "ink",
				});
				for (let Index = 0; Index < Plan.order; Index += 1) {
					Parts.push({
						d: scroll({
							Angle: Plan.jitter.phase + Index * Step,
							Radius: 20,
							Curl: 2.5,
							Direction: Index % 2 === 0 ? 1 : -1,
						}),
						tone: "accent",
					});
				}
			} else {
				for (let Index = 0; Index < 4; Index += 1) {
					Parts.push({
						d: quadrant({ Angle: 45 + Index * 90, Inner: 10, Outer: 32, Inset: 5 }),
						tone: "ink",
					});
					Parts.push({
						d: teardrop({ Angle: Index * 90, Radius: 30, Bulb: 4, Neck: 5 }),
						tone: "accent",
					});
				}
			}
			break;
		}
		case "quatrefoil": {
			for (let Index = 0; Index < 4; Index += 1) {
				const Angle = Plan.jitter.phase + Index * 90;
				if (Plan.variant === 0) {
					Parts.push({
						d: petal({ Angle, Outer: 34, Inner: 12, Width: 22 }),
						tone: "ink",
					});
					Parts.push({
						d: teardrop({ Angle: Angle + 45, Radius: 26, Bulb: 5, Neck: 6 }),
						tone: "accent",
					});
				} else if (Plan.variant === 1) {
					Parts.push({
						d: petal({ Angle: Angle + 45, Outer: 30, Inner: 10, Width: 30 }),
						tone: "ink",
					});
					Parts.push({
						d: orbit({
							Radius: 36,
							Count: 4,
							Glyph: "dot",
							OffsetAngle: Angle,
							Size: 1.4,
						}),
						tone: "accent",
					});
				} else {
					Parts.push({
						d: teardrop({ Angle, Radius: 30, Bulb: 7, Neck: 8 }),
						tone: "ink",
					});
					Parts.push({
						d: ring({ Radius: 18, GapAngle: Angle, GapWidth: 60 }),
						tone: "accent",
					});
				}
			}
			break;
		}
		case "crescent-ring": {
			for (let Index = 0; Index < Plan.order; Index += 1) {
				const Angle = Plan.jitter.phase + Index * Step;
				if (Plan.variant === 0) {
					Parts.push({
						d: petal({ Angle, Outer: 30, Inner: 14, Width: 12 }),
						tone: "ink",
					});
				} else if (Plan.variant === 1) {
					Parts.push({
						d: teardrop({ Angle, Radius: 26, Bulb: 5, Neck: 6 }),
						tone: "ink",
					});
				} else {
					Parts.push({
						d: scroll({
							Angle,
							Radius: 24,
							Curl: 3,
							Direction: Index % 2 === 0 ? 1 : -1,
						}),
						tone: "ink",
					});
				}
			}
			break;
		}
		case "spike-star":
		default: {
			for (let Index = 0; Index < Plan.order; Index += 1) {
				const Angle = Plan.jitter.phase + Index * Step;
				const Long = Plan.order <= 4 || Index % 2 === 0;
				const Outer = Long ? Plan.jitter.armOuter : Plan.jitter.armOuter * 0.68;
				Parts.push({
					d: spike({
						Angle,
						Outer,
						Inner: 12,
						Waist: Outer * Plan.jitter.armWaist,
						HalfWidth: Plan.jitter.armWidth,
					}),
					tone: "ink",
				});
				if (Plan.variant === 1) {
					Parts.push({
						d: petal({ Angle: Angle + Step / 2, Outer: 26, Inner: 12, Width: 10 }),
						tone: "accent",
					});
				} else if (Plan.variant === 2) {
					Parts.push({
						d: teardrop({ Angle: Angle + Step / 2, Radius: 28, Bulb: 4, Neck: 5 }),
						tone: "accent",
					});
				}
			}
			break;
		}
	}
	return Parts;
};

const rimOf = (Plan) => {
	const Parts = [];
	switch (Plan.rim) {
		case "square":
			Parts.push({ d: squareFrame({ Half: 42, Double: Plan.rimNotch }), tone: "accent" });
			break;
		case "scallop":
			Parts.push({ d: scallopFrame({ Radius: 41, Lobes: Plan.order }), tone: "accent" });
			break;
		case "woven":
			Parts.push({ d: wovenFrame({ Radius: 41, Count: Plan.order }), tone: "accent" });
			break;
		case "diamond":
			Parts.push({ d: diamondFrame({ Half: 42 }), tone: "accent" });
			break;
		default:
			break;
	}
	if (Plan.rimGap) {
		Parts.push({
			d: ring({ Radius: 37, GapAngle: Plan.jitter.phase, GapWidth: 24 }),
			tone: "ink",
		});
	}
	if (Plan.rimNotch) {
		Parts.push({ d: web({ Spokes: 4, Radii: [44, 47], Inner: 40 }), tone: "accent" });
	}
	return Parts;
};

const zonesOf = (Plan) => {
	const Parts = [];
	for (let Index = 1; Index <= Plan.rings; Index += 1) {
		Parts.push({ d: ring({ Radius: 13 + Index * 3 }), tone: "ink" });
	}
	for (let Index = 1; Index <= Plan.mutations.rings; Index += 1) {
		Parts.push({ d: ring({ Radius: 30 + Index * 2.5 }), tone: "accent" });
	}
	const TickRadius = Plan.mutations.rings > 0 ? 30 + Plan.mutations.rings * 2.5 : 38;
	const Ticks = Plan.mutations.rings > 0 ? Math.min(8, Plan.mutations.ticks) : 0;
	for (let Index = 0; Index < Ticks; Index += 1) {
		const Angle = (Index * 360) / Ticks + Plan.jitter.phase / 3;
		const Radians = (Angle * Math.PI) / 180;
		const Inner = {
			x: 50 + TickRadius * Math.cos(Radians),
			y: 50 + TickRadius * Math.sin(Radians),
		};
		const Outer = {
			x: 50 + (TickRadius + 2) * Math.cos(Radians),
			y: 50 + (TickRadius + 2) * Math.sin(Radians),
		};
		Parts.push({
			d: `M${Inner.x.toFixed(2)},${Inner.y.toFixed(2)} L${Outer.x.toFixed(2)},${Outer.y.toFixed(2)}`,
			tone: "accent",
		});
	}
	return Parts;
};

const detailOf = (Plan) => {
	const Parts = [];
	const Step = 360 / Plan.order;
	for (let Index = 0; Index < Plan.detail; Index += 1) {
		const Angle = Plan.jitter.detailPhase + Index * Step;
		Parts.push({
			d: scroll({ Angle, Radius: 16, Curl: 2.5, Direction: Index % 2 === 0 ? 1 : -1 }),
			tone: "ink",
		});
	}
	return Parts;
};

const layersOf = (Genome, Plan) => {
	const Parts = [];
	Parts.push(...rimOf(Plan));
	Parts.push(...zonesOf(Plan));
	Parts.push(...bodyOf(Plan));
	Parts.push(...detailOf(Plan));
	Parts.push({
		d: orbit({
			Radius: Plan.jitter.orbitRadius,
			Count: Plan.orbit,
			Glyph: Plan.orbitGlyph,
			OffsetAngle: Plan.jitter.phase / 2,
			Size: 1.6,
		}),
		tone: "accent",
	});
	const CoreGlyph = Plan.mode === "traced" ? "ring" : Plan.core;
	Parts.push({ d: core({ Glyph: CoreGlyph, Radius: 6 }), tone: "ink" });
	if (Plan.mode === "traced") {
		const Radians = (45 * Math.PI) / 180;
		const Inner = { x: 50 + 8 * Math.cos(Radians), y: 50 + 8 * Math.sin(Radians) };
		const Outer = { x: 50 + 16 * Math.cos(Radians), y: 50 + 16 * Math.sin(Radians) };
		Parts.push({
			d: `M${Inner.x.toFixed(2)},${Inner.y.toFixed(2)} L${Outer.x.toFixed(2)},${Outer.y.toFixed(2)}`,
			tone: "accent",
		});
	}
	return Parts;
};

const grouped = (Parts) => {
	const Seen = new Set();
	const Groups = [[], [], []];
	for (const Part of Parts) {
		if (Part.d.trim() === "" || Seen.has(Part.d)) {
			continue;
		}
		Seen.add(Part.d);
		Groups[TONES[Part.tone]].push(Part.d);
	}
	return Groups;
};

const label = (Genome, Plan) => `${Genome.package} - ${Plan.grammar}`;

const escape = (Text) =>
	Text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const traceOf = (Ink, Palette, Mono) => {
	const Stroke = Mono ? "currentColor" : Palette.ink;
	const Opacity = Mono ? "0.22" : "0.22";
	return `\n\t<g transform="translate(1.4,-1.4)" stroke-opacity="${Opacity}" fill="none">\n\t\t<path d="${Ink.join(" ")}" stroke="${Stroke}" stroke-width="1.8"/>\n\t</g>`;
};

export const renderMono = (Genome, Plan) => {
	const [Ink, Accent, Tint] = grouped(layersOf(Genome, Plan));
	const Trace = Plan.mode === "traced" ? traceOf(Ink, null, true) : "";
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escape(label(Genome, Plan))}">
	<title>${escape(label(Genome, Plan))}</title>
	<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
		<path d="${Ink.join(" ")}"/>
	</g>
	<g fill="none" stroke="currentColor" stroke-width="1.3" stroke-opacity="0.45" stroke-linecap="round" stroke-linejoin="round">
		<path d="${Accent.join(" ")}"/>
	</g>${
		Tint.length > 0
			? `\n\t<g fill="currentColor" fill-opacity="0.08" stroke="none">\n\t\t<path d="${Tint.join(" ")}"/>\n\t</g>`
			: ""
	}${Trace}
</svg>
`;
};

export const renderColour = (Genome, Plan) => {
	const Palette = palettesOf(Genome.kind);
	const [Ink, Accent, Tint] = grouped(layersOf(Genome, Plan));
	const Trace = Plan.mode === "traced" ? traceOf(Ink, Palette, false) : "";
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escape(label(Genome, Plan))}">
	<title>${escape(label(Genome, Plan))}</title>
	<g fill="none" stroke="${Palette.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
		<path d="${Ink.join(" ")}"/>
	</g>
	<g fill="none" stroke="${Palette.accent}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
		<path d="${Accent.join(" ")}"/>
	</g>${
		Tint.length > 0
			? `\n\t<g fill="${Palette.tint}" fill-opacity="0.9" stroke="none">\n\t\t<path d="${Tint.join(" ")}"/>\n\t</g>`
			: ""
	}${Trace}
</svg>
`;
};
