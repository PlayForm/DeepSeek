// Palette.mjs - per-package colour identity drawn from the dusk banner.
//
// SOURCE: Temporary/Icon-Reference/Banner.png (the "Beautiful Rust" pixel-art
// banner the user supplied). The k-means extraction of that image gives the
// family's whole vocabulary:
//
//   #364085 indigo   #183566 deep navy   #9499CB periwinkle
//   #261223 plum     #4D2D42 dark plum   #97568B mauve
//   #CF637E rose     #F67D55 coral       #FBBA5B amber
//   #B04523 rust     #F8E3B7 cream       #2A1823 rock
//
// The four kinds are mapped onto the banner's hue zones - indigo, coral, rose,
// violet - and the seed picks the exact ink, accent and second accent inside the
// zone. Tints mix toward the banner's cream (#F8E3B7), not toward white, so the
// generated icons sit on the same paper as the reference sheet.

import { stream } from "./Prng.mjs";

const Cream = { R: 0xf8, G: 0xe3, B: 0xb7 };

const Families = {
	hook: {
		inks: ["#1E3768", "#183566", "#26305E", "#223A6E", "#1B2F5C"],
		accents: ["#40548D", "#6F7FC0", "#9499CB", "#5B6BC0", "#7C8AD1"],
	},
	plugin: {
		inks: ["#4D2D42", "#3A2018", "#2A1823", "#46281F", "#33202E"],
		accents: ["#F67D55", "#E97E3B", "#FBBA5B", "#B04523", "#F09A6B"],
	},
	client: {
		inks: ["#261223", "#341630", "#3D1B33", "#2E1229", "#2A1823"],
		accents: ["#CF637E", "#C86BA8", "#9E5970", "#D76A9A", "#B45C8E"],
	},
	lib: {
		inks: ["#2A1B3D", "#33204A", "#2B1D4A", "#35233F", "#241536"],
		accents: ["#97568B", "#B07CC6", "#A66BB8", "#8A5A9E", "#C08AD0"],
	},
};

const channel = (Value) => Math.max(0, Math.min(255, Math.round(Value)));

/** Mix a hex colour toward the banner cream; Amount 0 keeps it, 1 is cream. */
const tintOf = (Hex, Amount = 0.84) => {
	const R = Number.parseInt(Hex.slice(1, 3), 16);
	const G = Number.parseInt(Hex.slice(3, 5), 16);
	const B = Number.parseInt(Hex.slice(5, 7), 16);
	const Mix = (Value, Target) => channel(Value + (Target - Value) * Amount);
	return `#${[Mix(R, Cream.R), Mix(G, Cream.G), Mix(B, Cream.B)]
		.map((Value) => Value.toString(16).padStart(2, "0"))
		.join("")
		.toUpperCase()}`;
};

/** The palette of one genome: kind zone, seed choice, cream-derived tint. */
export const palettesOf = (Genome) => {
	const Family = Families[Genome.kind] ?? Families.hook;
	const Random = stream(`${Genome.seed}palette`);
	const Ink = Random.pick(Family.inks);
	const Accent = Random.pick(Family.accents);
	const Others = Family.accents.filter((Value) => Value !== Accent);
	const Accent2 = Random.pick(Others.length > 0 ? Others : Family.accents);
	return {
		ink: Ink,
		accent: Accent,
		accent2: Accent2,
		tint: tintOf(Accent),
	};
};

/** The four family lists, exported for the docs and the ledger. */
export const familiesOf = () => Families;

/** The banner's own extracted colours, for the docs. */
export const bannerPaletteOf = () => ({
	indigo: "#364085",
	navy: "#183566",
	periwinkle: "#9499CB",
	plum: "#261223",
	darkPlum: "#4D2D42",
	mauve: "#97568B",
	rose: "#CF637E",
	coral: "#F67D55",
	amber: "#FBBA5B",
	rust: "#B04523",
	cream: "#F8E3B7",
	rock: "#2A1823",
});
