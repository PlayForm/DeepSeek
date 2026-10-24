import type Decision from "@Interface/Decision.js";
import type FactoryHandle from "@Interface/Factory.js";
import type PolicyRule from "@Interface/Policy.js";
import type RecoveryRule from "@Interface/Recovery.js";
import type { Allowlist, State as Base } from "@playform/ets-plugin-dsh-factory";
interface Extra {
    /** Config `enabled` - the master switch (volatile; the State builder's
     *  mapped `On` field). */
    On: boolean;
    /** Config `tools` - the gated tool names (volatile). */
    Tools: string[];
    /** Config `scope` - the authorized-scope allowlist (volatile). */
    Scope: string[];
    /** Config `exclude` - the never-gated target globs (volatile). */
    Exclude: string[];
    /** Config `policy` - the policy table (volatile). */
    PolicyRules: PolicyRule[];
    /** Config `recovery` - the recovery-table overrides (volatile). The
     *  resolved table is rebuilt per check (Function/Recovery) so hot edits
     *  apply on the next gated call. */
    RecoveryRules: RecoveryRule[];
    /** Config `loopBound` - the recursion loop bound (volatile). */
    LoopBound: number;
    /** Config `maxDecisions` - the decision ring bound (volatile). */
    MaxDecisions: number;
    /** The injected factory instance (the State builder, the ledger). */
    Factory: FactoryHandle;
    /** The bounded ring of the last MaxDecisions decisions (oldest first). */
    Decisions: Decision[];
    /** operation id -> gated count (recursion prevention; capped). */
    Recent: Map<string, number>;
    /** The plugin's own monotonic sequence of decisions (never a wall clock
     *  for identity; wall time appears only in the ledger timestamps). */
    Sequence: number;
    /** The hook's OWN actor marker object: an event carrying exactly this
     *  actor is the hook's own and is never gated (the identity check). */
    Self: object;
    /** The per-action allowlist (config `automation`, volatile) - the D6
     *  block. Named `Allow` because the factory's shared State already owns
     *  `Policy` (the configured global policy file path) and this hook's own
     *  `PolicyRules` is the decision rule table. This package's action class
     *  is RECORD (automatic); it has NO gated action. */
    Allow: Allowlist;
}
export default interface State extends Base, Extra {
}
export {};
