/** THE EXCLUSION LIST (the paths this script must never write). Three kinds:
 *  a. the hand-ported ETS-only files (the batch-edit clock shield,
 *     Source/Function/Shield.ts + ShieldSync.ts) have no Classic counterpart;
 *  b. the IN-FLIGHT LANE'S SEAM (the workspace-graph ledger append, which the
 *     concurrent lane is editing in the same working tree) - the generator
 *     must never race another lane's write, and the post-generation diff
 *     treats a diverged excluded file as that lane's, not as staleness;
 *  c. THE CLASSIC-ONLY DEPENDENCY (the two Learning-Loop folders). The
 *     regenerated Test harnesses import the REAL `plugin-dsh-pattern`
 *     service, and that candidate has NO ETS twin (POC-LEDGER.md: the
 *     pattern/batch-decision candidates are Classic-only). The ETS tree
 *     cannot mix the Classic graph, so the service-present folder is not
 *     generated; the twin's harness keeps the plugin's in-memory fallback
 *     path (the post-generation patch below). A folder exclusion ends with
 *     "/" and covers every file under it. */
const Excluded = new Map([
	[
		"ets-plugin-dsh-batch-edit",
		new Set(["Source/Function/Shield.ts", "Source/Function/ShieldSync.ts"]),
	],
	["ets-plugin-dsh-workspace-graph", new Set(["Source/Function/Append.ts"])],
	["ets-hook-dsh-doc-suggester", new Set(["Source/Test/Learning-Loop/"])],
	["ets-hook-dsh-edit-suggester", new Set(["Source/Test/Learning-Loop/"])],
]);

export default Excluded;
