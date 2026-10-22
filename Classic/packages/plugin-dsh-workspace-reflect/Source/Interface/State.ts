// State - the plugin's per-apply state: the SHARED factory shape (Context,
// Module, Enabled/Ledger/List, the machinery maps, the P10 volatile refresh
// the factory's State builder registers) plus the plugin's own fields.
//
// Module is "reflect" - the frozen ledger lines are `reflect: ...` (the
// module's OWN contract string), and the factory's Append prefixes with
// `<State.Module>: `. The npm identity lives in the package name and the
// `name` export (plugin-dsh-workspace-reflect); the ledger prefix is the
// module's OWN contract string.
import type FactoryHandle from "@Interface/Factory.js";
import type { State as Base } from "@playform/plugin-dsh-factory";

interface Extra {
	/** The master switch (mapped from config `enabled` by the State build's
	 *  fields map). */
	On: boolean;
	/** Config `propagate` - the default rename scope (volatile). */
	Propagate: "block" | "file";
	/** Config `maxFileBytes` - the file size bound (volatile). */
	MaxFileBytes: number;
	/** Config `maxBlockLines` - the span width bound (volatile). */
	MaxBlockLines: number;
	/** The injected factory instance (the State builder, the ledger, the
	 *  guarded write). */
	Factory: FactoryHandle;
}

export default interface State extends Base, Extra {}
