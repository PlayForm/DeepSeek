// Semantics - the optional workspace-semantics service probe
// (Function/Semantics): the rename's scope-resolved plan comes from the
// semantics service (its `rename(path, span, to)`), which may itself deepen the
// answer through the harness LSP seam. THE SERVICE IS PROBED, NEVER INJECTED
// (`ctx.get`) - the loader contract's `inject` stays ["pluginFactory", "fs"] -
// and the registered name is `workspaceSemantics`; the plan's short alias
// `semantics` is accepted too. An absent service (or one without a rename
// method) is `undefined`: the textual whole-word engine stays in charge.
import type SemanticsHandle from "@Interface/Semantics.js";
import type State from "@Interface/State.js";

/** The probed names: the registered name first, then the plan's short alias. */
const Names = ["workspaceSemantics", "semantics"];

export default (State: State): SemanticsHandle | undefined => {
	for (const Name of Names) {
		const Service = (State.Context as { get?: (Name: string) => unknown }).get?.(Name);
		switch (true) {
			case typeof (Service as { rename?: unknown } | null)?.rename === "function":
				return Service as SemanticsHandle;
			default:
		}
	}
	return undefined;
};
