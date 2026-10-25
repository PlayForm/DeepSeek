// Lexicon.mjs - the transliteration dictionary: code semantics <-> visual layers.
//
// Every construct the harness code exposes has ONE visual token. The icon is the
// transliteration of a package's semantics into layers; reading the layers back
// through this dictionary returns the semantics. That is the whole contract:
//
//   code construct        semantic token     visual layer     glyph
//   .on("x/y")            gate               body             hook / ray at hashed angle
//   registerTool(...)     tool               orbit            bead
//   ctx.provide("x")      service            core             hexagon / void diamond
//   inject = [...]        injection          evolution        one ring per injection
//   prepend/append        seam               rim              chevron tick
//   ledger strings        ledger             detail           bead string
//   "refuse"/"skip"       refusal            rim              wedge cutout (subtract)
//   normalize flavor      transform          body             cusp pair
//   "stream"              stream             body             open spiral
//   "state"/"storage"     state              core             nested ring
//   "trace"/span          trace              body             parallel contour
//
// "Impose" means the feature forces the token on; "infer" means the level or the
// seed chooses it; "disable" means the package cannot carry it (e.g. a library
// has no tools, so no orbit).

export const Lexicon = [
	{
		token: "gate",
		layer: "body",
		zone: "body",
		glyph: "hook",
		count: (Tokens) => Math.min(8, Tokens.length),
		reverse: "a hook in the body is one event gate the package subscribes to",
	},
	{
		token: "tool",
		layer: "orbit",
		zone: "orbit",
		glyph: "bead",
		count: (Tokens) => Math.min(12, Tokens.length),
		reverse: "a bead on the orbit is one tool the package registers",
	},
	{
		token: "service",
		layer: "core",
		zone: "core",
		glyph: "void",
		count: (Tokens) => Math.min(2, Tokens.length),
		reverse: "the core medallion is the service the package provides",
	},
	{
		token: "injection",
		layer: "evolution",
		zone: "evolution",
		glyph: "ring",
		count: (Tokens) => Math.min(3, Tokens.length),
		reverse: "an evolution ring is one service the package injects",
	},
	{
		token: "seam",
		layer: "rim",
		zone: "rim",
		glyph: "tick",
		count: (Tokens) => Math.min(8, Tokens.length),
		reverse: "a rim tick is one ordering seam the package claims",
	},
	{
		token: "ledger",
		layer: "detail",
		zone: "detail",
		glyph: "beads",
		count: (Tokens) => Math.min(14, Tokens.length),
		reverse: "a bead on the detail band is one ledger line the package writes",
	},
	{
		token: "refusal",
		layer: "rim",
		zone: "rim",
		glyph: "wedgeCut",
		count: (Tokens) => Math.min(8, Tokens.length),
		reverse: "a wedge cut from the rim is one refusal path the package owns",
	},
	{
		token: "transform",
		layer: "body",
		zone: "body",
		glyph: "cusp",
		count: (Tokens) => Math.min(6, Tokens.length),
		reverse: "a cusp pair in the body is one transform the package applies",
	},
	{
		token: "stream",
		layer: "body",
		zone: "body",
		glyph: "spiral",
		count: (Tokens) => Math.min(2, Tokens.length),
		reverse: "an open spiral is a stream the package reads",
	},
	{
		token: "state",
		layer: "core",
		zone: "core",
		glyph: "nest",
		count: () => 1,
		reverse: "a nested ring in the core is persistent state the package keeps",
	},
	{
		token: "trace",
		layer: "body",
		zone: "body",
		glyph: "parallel",
		count: () => 1,
		reverse: "a parallel contour is tracing the package emits",
	},
];

/** The lexicon entry of a token, or undefined. */
export const entryOf = (Token) => Lexicon.find((Entry) => Entry.token === Token);

/** The semantic reading of one visual layer (the reverse direction). */
export const readLayer = (Layer) => Lexicon.filter((Entry) => Entry.layer === Layer).map((Entry) => Entry.reverse);

/** A stable angle for a named token, so the same gate always lands in the same place. */
export const angleOf = (Name, Seed = 0) => {
	let Hash = 2166136261 ^ Seed;
	for (const Character of String(Name)) {
		Hash ^= Character.charCodeAt(0);
		Hash = Math.imul(Hash, 16777619);
	}
	return (Hash >>> 0) % 360;
};
