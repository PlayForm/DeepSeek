// State - the hook's per-apply state: the SHARED factory shape (Context,
// Module, Enabled/Ledger/List, the machinery maps, the P10 volatile refresh
// the factory's State builder registers) plus the hook's own fields.
//
// Module is "audit" - the factory's Append prefixes with
// `<State.Module>: `, so the ledger lines render as "audit: ...". The npm
// identity lives in the package name and the `name` export
// (hook-dsh-workspace-audit); the ledger prefix is the module's OWN
// contract string.
import type DomainHandle from "@Interface/Domain.js";
import type FactoryHandle from "@Interface/Factory.js";
import type Line from "@Interface/Line.js";
import type { Allowlist, State as Base } from "@playform/plugin-dsh-factory";

interface Extra {
	/** The master switch (config `enabled` - the IDLE-forever posture). */
	On: boolean;
	/** Config `domain` - the KV domain NAME (volatile). Named DomainName to
	 *  stay clear of the factory's shared `Domain` handle field. */
	DomainName: string;
	/** Config `maxLines` - the ring bound (volatile). */
	MaxLines: number;
	/** The per-action allowlist (config `policy`, volatile) - the D6 block.
	 *  Named `Allow` because the factory's shared State already owns `Policy`
	 *  (the configured global policy file path). This package's actions are
	 *  automatic; it has NO gated action. */
	Allow: Allowlist;
	/** The injected factory instance (the State builder, the ledger, the
	 *  match, the Wire). */
	Factory: FactoryHandle;
	/** The lines by operation ID (the chain view). */
	Chains: Map<string, Line[]>;
	/** The bounded ring of the last MaxLines lines (oldest first). */
	Ring: Line[];
	/** The plugin's own monotonic sequence (never a wall clock). */
	Sequence: number;
	/** The open storage domain handle; `undefined` while pending, after a
	 *  silent skip (absent facility), or after the effect's disposer. */
	Handle: DomainHandle | undefined;
	/** The hook's OWN actor marker object: an event carrying exactly this
	 *  actor is the hook's own and is ignored (the identity check). */
	Self: object;
}

export default interface State extends Base, Extra {}
