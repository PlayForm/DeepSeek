// State - the plugin's per-apply state (Interface/State): the SHARED factory
// shape (Context, Module, Enabled/Ledger, the machinery maps, the P10
// volatile refresh the factory's State builder registers) plus the
// batch-state's own fields.
//
// Module is "batchstate" - the module-owned ledger lines are `batchstate: ...`
// and the factory's Append prefixes with `<State.Module>: `. The npm identity
// lives in the package name and the `name` export (plugin-dsh-batchstate);
// the ledger prefix is the module's OWN contract string.
import type FactoryHandle from "@Interface/Factory.js";
import type Member from "@Interface/Member.js";
import type { State as Base } from "@playform/plugin-dsh-factory";

interface Extra {
	/** The master switch (config `enabled` - the IDLE-forever posture). */
	On: boolean;
	/** Config `batch` - the batch key (multi-batch isolation; volatile). */
	Batch: string;
	/** Config `stateFile` - the well-known JSON state file (volatile). */
	StateFile: string;
	/** Config `maxRecent` - the completions ring bound (volatile). */
	MaxRecent: number;
	/** The injected factory instance (the State builder, the ledger). */
	Factory: FactoryHandle;
	/** The live members, keyed by the agent id. */
	Members: Map<string, Member>;
	/** The idle queue, in order (the member ids). Named IdleQueue to stay
	 *  clear of the factory's shared pre-open journal `Queue` field. */
	IdleQueue: string[];
	/** The completions ring, newest first, bounded by MaxRecent. */
	Recent: { id: string; status: string; task: string; at: number }[];
}

export default interface State extends Base, Extra {}
