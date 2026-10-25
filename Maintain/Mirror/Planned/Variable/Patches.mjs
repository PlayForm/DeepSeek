import HarnessPatches from "./Seams.mjs";

/** THE POST-GENERATION PATCHES (the hand-port's REFERENCING half): applied to
 *  the SUBSTITUTED text, after the mirror write. `Find` must occur exactly
 *  once or the run aborts - a moved anchor is a hard error, never a silent
 *  loss. Every entry names its reason so the table stays self-documenting.
 *  The table carries TWO kinds:
 *   a. the shield's referencing half (batch-edit Apply.ts / Ops.ts);
 *   b. the client bundle identity (the wave-5 K1 edge case): the build script
 *      passes the package name as an UNQUOTED shell argument to
 *      Maintain/Build/Client-Bundle/Index.mjs, so the quoted-name rules cannot see
 *      it and the bundle's loader `id:` would stay Classic while the section's
 *      quoted `bundle:` field and the smoke's K1 assertion became ETS. The
 *      loader id must be the twin's package name; the patch is the ONE home of
 *      that identity, so a regeneration keeps it. */
const Patches = [
	{
		Twin: "ets-plugin-dsh-batch-edit",
		File: "Source/Function/Apply.ts",
		Reason: "the shield import (ShieldSync wraps the ledger append seam)",
		Find: 'import * as Machine from "./Machine.js";\nimport Tools from "./Tools.js";',
		Replace:
			'import * as Machine from "./Machine.js";\nimport ShieldSync from "./ShieldSync.js";\nimport Tools from "./Tools.js";',
	},
	{
		Twin: "ets-plugin-dsh-batch-edit",
		File: "Source/Function/Apply.ts",
		Reason: "the shielded ledger sink (the factory's Append tracer samples Date.now)",
		Find: [
			"\t// The ledger sink every module receives (Factory.Append with the State",
			"\t// bound).",
			"\tconst Append = (Message: string): void => {",
			"\t\tFactory.Append(State, Message);",
			"\t};",
		].join("\n"),
		Replace: [
			"\t// The ledger sink every module receives (Factory.Append with the State",
			"\t// bound). The factory's append seam runs a spanned Effect whose tracer",
			"\t// samples the global Date.now internally - ShieldSync keeps those",
			"\t// internal samples out of the caller's deadline budget (Function/",
			"\t// ShieldSync).",
			"\tconst Append = (Message: string): void => {",
			"\t\tShieldSync(() => Factory.Append(State, Message));",
			"\t};",
		].join("\n"),
	},
	{
		Twin: "ets-plugin-dsh-batch-edit",
		File: "Source/Function/Ops.ts",
		Reason: "the shield import for ApplyWrite",
		Find: 'import { Cells } from "./Present.js";',
		Replace: 'import { Cells } from "./Present.js";\nimport Shield from "./Shield.js";',
	},
	{
		Twin: "ets-plugin-dsh-batch-edit",
		File: "Source/Function/Ops.ts",
		Reason: "the shielded write/govern seam (ApplyWrite's awaited Effect spans)",
		Find: [
			"const ApplyWrite = async (",
			"\tState: State,",
			"\tPlan: Plan,",
			"\tExec: ToolRunContext | undefined,",
			"): Promise<string> => {",
			"\tconst Actor = { ...(Exec as object | undefined), govern: true };",
			"\tconst Outcome = await State.Factory.Write(State, Plan.target, Plan.after, {",
			'\t\tintent: { kind: "replaceIfVersion", version: Plan.cell.version ?? "" },',
			"\t\tactor: Actor,",
			"\t\tstash: true,",
			"\t\tsignal: Exec?.signal,",
			"\t});",
			"\tswitch (true) {",
			"\t\tcase GovernedBasenames.includes(Base(Plan.target.displayPath)):",
			"\t\t\tawait State.Factory.Govern(Plan.target, true, Actor, Outcome.version);",
			"\t\t\tbreak;",
			"\t}",
			"\treturn Outcome.version;",
			"};",
		].join("\n"),
		Replace: [
			"const ApplyWrite = async (",
			"\tState: State,",
			"\tPlan: Plan,",
			"\tExec: ToolRunContext | undefined,",
			"): Promise<string> =>",
			"\t// The factory's write/govern seams run spanned Effects whose tracer",
			"\t// samples the global Date.now internally - Shield keeps those internal",
			"\t// samples out of the commit deadline's budget (Function/Shield).",
			"\tShield(async () => {",
			"\t\tconst Actor = { ...(Exec as object | undefined), govern: true };",
			"\t\tconst Outcome = await State.Factory.Write(State, Plan.target, Plan.after, {",
			'\t\t\tintent: { kind: "replaceIfVersion", version: Plan.cell.version ?? "" },',
			"\t\t\tactor: Actor,",
			"\t\t\tstash: true,",
			"\t\t\tsignal: Exec?.signal,",
			"\t\t});",
			"\t\tswitch (true) {",
			"\t\t\tcase GovernedBasenames.includes(Base(Plan.target.displayPath)):",
			"\t\t\t\tawait State.Factory.Govern(Plan.target, true, Actor, Outcome.version);",
			"\t\t\t\tbreak;",
			"\t\t}",
			"\t\treturn Outcome.version;",
			"\t});",
		].join("\n"),
	},
	{
		Twin: "ets-client-dsh-workspace-live",
		File: "Source/prepublishOnly.sh",
		Reason: "the client bundle's loader id (the unquoted Build-Client-Bundle argument the quoted package rules cannot see)",
		Find: "node ../../../Maintain/Build/Client-Bundle/Index.mjs . Source/Client.ts @playform/client-dsh-workspace-live",
		Replace:
			"node ../../../Maintain/Build/Client-Bundle/Index.mjs . Source/Client.ts @playform/ets-client-dsh-workspace-live",
	},
];

Patches.push(...HarnessPatches);

export default Patches;
