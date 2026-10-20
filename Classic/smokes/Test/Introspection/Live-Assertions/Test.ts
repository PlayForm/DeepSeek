// smokes/Test/Introspection/Live-Assertions/Test.ts - one singular test: the
// harness projects the family's registration surface - the composed entry
// ids/names, the configuration schema document, and the plugin-manager
// surface resolving the installed bundles. The `cordis_inspect_list`/
// `cordis_inspect_query` providers are session surfaces (a live agent
// session is required) - the headless proxies asserted here are the
// composed-tree and CLI equivalents; the session-only projection is
// documented as a residual. Split from introspection-smoke.mjs: this folder
// carries the suite's live assertions; the skip guard and the harness checks
// live in the sibling Gate-And-Harness folder.
// Tree-agnostic: this folder exercises the LIVE harness via the shared
// wiring-live.mjs and imports nothing from the tree Targets, so the Classic
// and EffectTS copies differ by the tree's own package names only.
import * as Wiring from "../../../wiring-live.mjs";

let Pass = 0;
let Fail = 0;
const Check = (Condition: boolean, Message: string): void => {
	if (Condition) {
		Pass += 1;
		console.log(`PASS - ${Message}`);
	} else {
		Fail += 1;
		console.log(`FAIL - ${Message}`);
	}
};

if (!Wiring.ScratchHome()) {
	console.log("SKIPPED (no scratch home)");
	process.exit(0);
}

// Group: the registered names - every family plugin is composed under its
// exact id and package name (the names the runtime projection resolves).
{
	const Dump = (await Wiring.DumpConfig("plain")) as string;
	const Families: Array<[string, string]> = [
		["plugin-dsh-factory", "@playform/plugin-dsh-factory"],
		["hook-dsh-package-governor", "@playform/hook-dsh-package-governor"],
		["hook-dsh-package-pinner", "@playform/hook-dsh-package-pinner"],
		["hook-dsh-cargo-governor", "@playform/hook-dsh-cargo-governor"],
		["hook-dsh-normalize-dash", "@playform/hook-dsh-normalize-dash"],
		["hook-dsh-normalize-quotes", "@playform/hook-dsh-normalize-quotes"],
		["hook-dsh-normalize-ellipsis", "@playform/hook-dsh-normalize-ellipsis"],
		["hook-dsh-normalize-spaces", "@playform/hook-dsh-normalize-spaces"],
		["hook-dsh-normalize-invisible", "@playform/hook-dsh-normalize-invisible"],
		["hook-dsh-normalize-fullwidth", "@playform/hook-dsh-normalize-fullwidth"],
		["hook-dsh-normalize-file", "@playform/hook-dsh-normalize-file"],
	];
	for (const [Id, Name] of Families) {
		const Start = Dump.indexOf(`- id: ${Id}\n`);
		Check(
			Start > 0 && Dump.slice(Start, Start + 200).includes(`name: '${Name}'`),
			`the composed entry ${Id} carries the exact registered name ${Name}`,
		);
	}
}

// Group: the observation policy is projected too (the family's write path
// partner).
{
	const Dump = (await Wiring.DumpConfig("plain")) as string;
	Check(
		Dump.includes("- id: fs-observation-policy"),
		"the fs-observation-policy entry is projected (the governed write path's intent gate)",
	);
}

// Group: the config schema document - the harness's self-describing
// configuration surface parses and describes the entry-list/patch dialect
// the family plugs into.
{
	const Schema = JSON.parse((await Wiring.DumpSchema()) as string);
	Check(
		Schema.title === "Cordis configuration for profile dsh-test",
		"the schema document titles the dsh-test profile",
	);
	Check(
		typeof Schema.$defs === "object" && Schema.$defs.entry !== undefined,
		"the schema document defines the entry dialect",
	);
	Check(
		Schema.$comment.includes("A patch config replaces the whole config"),
		"the schema document states the wholesale-replacement rule",
	);
}

// Group: the plugin-manager surface - the installed bundles resolve by name.
{
	const Core = (await Wiring.PluginWhy("@playform/hook-dsh-core"))!;
	Check(
		Core.status === 0 && Core.stdout.includes("@playform/hook-dsh-core@0.0.1"),
		"the plugin surface resolves the core bundle",
	);
	const Factory = (await Wiring.PluginWhy("@playform/plugin-dsh-factory"))!;
	Check(
		Factory.status === 0 && Factory.stdout.includes("@playform/plugin-dsh-factory@0.0.1"),
		"the plugin surface resolves the factory bundle",
	);
}

// The session-only projection is a residual - `cordis_inspect_list` /
// `cordis_inspect_query` require a live agent session; the headless battery
// covers the composed-tree equivalent (see the wiring report).

console.log(`${Pass} PASS - Introspection/Live-Assertions`);
process.exit(Fail === 0 ? 0 : 1);
