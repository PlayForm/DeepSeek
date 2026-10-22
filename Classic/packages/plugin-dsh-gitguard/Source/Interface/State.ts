// State - the plugin's per-apply state (Interface/State): the SHARED factory
// shape (Context, Module, Enabled/Ledger, the machinery maps, the P10
// volatile refresh the factory's State builder registers) plus the git
// guard's own fields.
//
// Module is "gitguard" - the module-owned ledger lines are `gitguard: ...`
// and the factory's Append prefixes with `<State.Module>: `. The npm
// identity lives in the package name and the `name` export
// (plugin-dsh-gitguard); the ledger prefix is the module's OWN contract
// string.
import type FactoryHandle from "@Interface/Factory.js";
import type { State as Base } from "@playform/plugin-dsh-factory";

interface Extra {
	/** Master switch (config `enabled`, volatile) - false = full passthrough. */
	On: boolean;
	/** Config `denyPatterns` - the refused git subcommands (volatile). */
	Deny: string[];
	/** Config `allowPatterns` - the allowed git subcommands (volatile). */
	Allow: string[];
	/** Config `strict` - deny EVERY git command (volatile). */
	Strict: boolean;
	/** The injected factory instance (the State builder, the ledger, the
	 *  exclusion match). */
	Factory: FactoryHandle;
}

// The intersection of the shared base and the git guard's own fields, as a
// single default interface (verbatimModuleSyntax forbids `export default` of
// a type alias reference - the hook-dsh-workspace-observe precedent).
export default interface State extends Base, Extra {}
