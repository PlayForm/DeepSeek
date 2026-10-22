// State - the service's per-apply state: the SHARED factory shape (Context,
// Module, Enabled/Ledger/List, the machinery maps, the P10 volatile refresh
// the factory's State builder registers) plus the service's own fields.
//
// Module is "evidence" - the frozen ledger lines are `evidence: ...` (the
// module-owned ledger strings law: this module owns its strings). The npm
// identity lives in the package name and the `name` export
// (plugin-dsh-workspace-evidence).
import type DomainHandle from "@Interface/Domain.js";
import type FactoryHandle from "@Interface/Factory.js";
import type Validation from "@Interface/Validation.js";
import type { State as Base } from "@playform/ets-plugin-dsh-factory";

interface Extra {
	/** Config `domain` - the KV domain NAME (volatile). Named DomainName to
	 *  stay clear of the factory's shared `Domain` handle field. */
	DomainName: string;
	/** Config `maxValidations` - the store bound (volatile). */
	MaxValidations: number;
	/** The injected factory instance (the State builder, the ledger, the
	 *  match, the Wire). */
	Factory: FactoryHandle;
	/** The validation objects, keyed by the claim id. */
	Store: Map<string, Validation>;
	/** The service's own monotonic sequence (never a wall clock). */
	Sequence: number;
	/** The open storage domain handle; `undefined` while pending, after a
	 *  silent skip (absent facility), or after the effect's disposer. */
	Handle: DomainHandle | undefined;
	/** The service's OWN actor marker object: an event carrying exactly this
	 *  actor is the service's own and is ignored (the identity check). */
	Self: object;
}

export default interface State extends Base, Extra {}
