import type Adapter from "@Interface/Adapter.js";
import type Deepening from "@Interface/Deepening.js";
import type DomainHandle from "@Interface/Domain.js";
import type FactoryHandle from "@Interface/Factory.js";
import type Model from "@Interface/Model.js";
import type { Allowlist, State as Base } from "@playform/plugin-dsh-factory";
interface Extra {
    /** The master switch (config `enabled` - the IDLE-forever posture). */
    On: boolean;
    /** Config `domain` - the KV domain NAME (volatile). Named DomainName to
     *  stay clear of the factory's shared `Domain` handle field. */
    DomainName: string;
    /** Config `maxEntries` - the index bound (volatile). */
    MaxEntries: number;
    /** The per-action allowlist (config `policy`, volatile) - the D6 block.
     *  Named `Allow` because the factory's shared State already owns `Policy`
     *  (the configured global policy file path). This package's actions are
     *  automatic; it has NO gated action. */
    Allow: Allowlist;
    /** Config `root` - the workspace root the deepener's queries run against
     *  (volatile); the empty string means the process working directory. */
    Root: string;
    /** Config `lsp` - whether the harness LSP deepener is registered
     *  (volatile; false keeps the model purely lexical). */
    UseLsp: boolean;
    /** Config `adapters` - the names of the OPT-IN any-file adapters the
     *  service registers beside the default TypeScript one (volatile). The
     *  default is empty: the seven TypeScript/JavaScript extensions only. */
    AdapterNames: string[];
    /** The injected factory instance (the State builder, the ledger, the
     *  match, the Wire). */
    Factory: FactoryHandle;
    /** The injected `fs` facility (readText for the lazy model build). */
    Fs: unknown;
    /** The built models, keyed by path (the index). */
    Index: Map<string, Model>;
    /** The service's own monotonic index revision (never a wall clock). */
    Revision: number;
    /** The adapter registry, keyed by extension (with dot, lowercase) or by
     *  exact basename (the file adapters). */
    Adapters: Map<string, Adapter>;
    /** The deepener registry, keyed by extension (with dot, lowercase). */
    Deepenings: Map<string, Deepening>;
    /** The open storage domain handle; `undefined` while pending, after a
     *  silent skip (absent facility), or after the effect's disposer. */
    Handle: DomainHandle | undefined;
    /** The service's OWN actor marker object: an event carrying exactly this
     *  actor is the service's own and is ignored (the identity check). */
    Self: object;
}
export default interface State extends Base, Extra {
}
export {};
