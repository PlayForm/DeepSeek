// Source/Test/Tables/Test.ts - one singular test: the six normalization tables
// carry their exact contents - the four character classes (Dashes, Ellipsis,
// Spaces, Invisible) with the g flag and their pattern sources verbatim, and
// the two maps (Quotes, Fullwidth) with their exact entries.
// Runs standalone (`node Target/Test/Tables/Test.js`) AND under the aggregate
// (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-lib-dsh-core: the REAL built entry only.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import {
	Dashes,
	Ellipsis,
	Fullwidth,
	Invisible,
	Quotes,
	Spaces,
} from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the normalization tables - the six exact contents.
	{
		// Sub: the four character classes. The Check label is the source
		// suite's ok label, verbatim.
		Check(
			Count,
			"tables: the four character classes carry their exact patterns (Dashes = the dash identity, verbatim)",
			() => {
				assert.equal(Dashes.flags, "g", "the character-class tables carry the g flag");
				assert.deepEqual(
					[Ellipsis.flags, Spaces.flags, Invisible.flags],
					["g", "g", "g"],
					"Ellipsis/Spaces/Invisible carry the g flag",
				);
				assert.equal(
					Dashes.source,
					"[\\u058A\\u05BE\\u1400\\u1806\\u2010-\\u2015\\u2E17\\u2E1A\\u2E3A-\\u2E3B\\u2E40\\u2E5D\\u301C\\u3030\\u30A0\\uFE31-\\uFE32\\uFE58\\uFE63\\uFF0D]",
					"the Dashes source is the dash pattern verbatim",
				);
				assert.equal(
					Ellipsis.source,
					"[\\u2026]",
					"the Ellipsis source is the single ellipsis character",
				);
				assert.equal(
					Spaces.source,
					"[\\u00A0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000]",
					"the Spaces source is the unicode space class (Zs minus ASCII)",
				);
				assert.equal(
					Invisible.source,
					"[\\u00AD\\u200B\\u200C\\u200D\\u200E\\u200F\\u202A-\\u202E\\u2060\\uFEFF]",
					"the Invisible source is the zero-width/invisible class",
				);
			},
		);
	}
	{
		// Sub: the two maps. The Check label is the source suite's ok label,
		// verbatim (the curly/straight arrow is escaped for an ASCII source
		// file).
		Check(
			Count,
			"tables: the two maps carry their exact contents (Quotes curly\u2192straight, Fullwidth the standard 94-entry table)",
			() => {
				assert.deepEqual(
					Quotes,
					{
						"\u2018": "'",
						"\u2019": "'",
						"\u201A": "'",
						"\u201B": "'",
						"\u201C": '"',
						"\u201D": '"',
						"\u201E": '"',
						"\u201F": '"',
					},
					"the Quotes map is the curly \u2192 straight quote table",
				);
				const FullwidthComputed: Record<string, string> = {};
				for (let i = 0; i < 94; i++) {
					FullwidthComputed[String.fromCharCode(0xff01 + i)] = String.fromCharCode(
						0x21 + i,
					);
				}
				assert.deepEqual(
					Fullwidth,
					FullwidthComputed,
					"the Fullwidth map is the standard fullwidth-to-halfwidth table (U+FF01\u2013U+FF5E \u2192 U+0021\u2013U+007E)",
				);
			},
		);
	}
	return Finish(Count, "Tables");
};

// Standalone entry: `node Target/Test/Tables/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Tables`);
}
