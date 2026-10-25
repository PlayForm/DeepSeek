/** THE CLASSIC-ONLY-SERVICE ADAPTATION (exclusion list kind c): the two
 *  suggester harnesses mirror the Classic harness minus the REAL pattern
 *  service, which has no ETS twin. The plugin probes `ctx.get("pattern")`
 *  optionally, so dropping the import and its helper leaves every ETS folder
 *  on the documented in-memory fallback - the plugin's own neutral path, not
 *  a fake. The Learning-Loop folder (the service-present path) is excluded
 *  above; the shared literals live here ONCE and patch both twins. */
const LearningSeams =
	"// THE LEARNING SEAMS (the D8 layer): `Home` is a fresh OS temp directory\n" +
	"// assigned to $HOME BEFORE any construction, so the optional pattern\n" +
	"// service's JSON fallback path (`~/.dsh/pattern/registry.json`) can never\n" +
	"// read or write the user's real home; `Pattern` builds the REAL\n" +
	"// PatternService from its built Target over a fake storage facility\n" +
	"// (`FakeStorage`, the authority/evidence fake-storage pattern: the open\n" +
	"// capture, the map-backed tables, the version fence), so the learning smokes\n" +
	"// exercise the service's real Record/Get/Put/Save semantics over a real KV\n" +
	'// domain, and a "reopen" is a second service over the same tables. A folder\n' +
	"// that never attaches a service gets the plugin's in-memory fallback - the\n" +
	"// neutral path every pre-learning folder runs on.";

const LearningSeamsEts =
	"// THE LEARNING SEAMS (the D8 layer): `Home` is a fresh OS temp directory\n" +
	"// assigned to $HOME BEFORE any construction, so the optional pattern\n" +
	"// service's JSON fallback path (`~/.dsh/pattern/registry.json`) can never\n" +
	"// read or write the user's real home. THE SERVICE ITSELF IS CLASSIC-ONLY:\n" +
	"// `plugin-dsh-pattern` is a Classic candidate with no ETS twin, so the ETS\n" +
	"// tree cannot mix that graph and NO ETS folder attaches it - every folder\n" +
	"// runs the plugin's in-memory fallback, the neutral path. `FakeStorage`\n" +
	"// stays as the shared fake-storage fixture (the Classic service-present\n" +
	"// folder uses it); the Learning-Loop folder is not generated (see the\n" +
	"// exclusion list), so the ETS harness is the mirror minus one import.";

const PatternHelper =
	"/**\n" +
	" * The REAL pattern service over a fake storage facility - the optional\n" +
	' * service the plugin probes with `ctx.get("pattern")`. Its own ledger is\n' +
	" * discarded (the learning assertions read Get/List, never the service's\n" +
	" * lines). Attach it to a Run with `Run.Context.pattern = Pattern(Store)`.\n" +
	" */\n" +
	"export const Pattern = (Store: any): any => {\n" +
	"\tconst Context: any = {\n" +
	"\t\tlogger: { info: () => undefined, warn: () => undefined },\n" +
	"\t\tget: (Name: string) => Context[Name],\n" +
	"\t\teffect: () => () => true,\n" +
	"\t\treflect: { provide: () => () => true },\n" +
	"\t};\n" +
	"\tContext.storageDomain = Store.facility;\n" +
	"\treturn new PatternService(Context, {});\n" +
	"};\n\n";

const SuggesterTwins = ["ets-hook-dsh-doc-suggester", "ets-hook-dsh-edit-suggester"];

const HarnessPatches = SuggesterTwins.flatMap((Twin) => [
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "drop the Classic-only pattern-service import",
		Find: 'import PatternService from "../../../ets-plugin-dsh-pattern/Target/Library.js";\n',
		Replace: "",
	},
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "drop the pattern service from the harness's exports",
		Find: "export { Plugin, Exports, PatternService };",
		Replace: "export { Plugin, Exports };",
	},
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "drop the Pattern helper (the service has no ETS twin)",
		Find: PatternHelper,
		Replace: "",
	},
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "record the Classic-only service in the learning-seams comment",
		Find: LearningSeams,
		Replace: LearningSeamsEts,
	},
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "record the Classic-only service in the fake-storage fixture comment",
		Find:
			" * the open capture, the map-backed tables, the version fence. The REAL\n" +
			" * PatternService opens a domain through it, so the learning smokes exercise\n" +
			' * the service\'s own Record/Put/Save and the real KV round-trip; a "reopen" is\n' +
			" * a second service over the SAME tables.",
		Replace:
			" * the open capture, the map-backed tables, the version fence. The Classic\n" +
			" * PatternService opens a domain through it; the ETS twin keeps the fixture\n" +
			" * (the harness stays a mirror) but has no service to attach, so no ETS\n" +
			" * folder uses it.",
	},
]);

export default HarnessPatches;
