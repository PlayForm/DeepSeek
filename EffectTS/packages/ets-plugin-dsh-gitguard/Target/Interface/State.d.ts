import type FactoryHandle from "./Factory.js";
import type { Allowlist, State as Base } from "@playform/ets-plugin-dsh-factory";
interface Extra {
    /** Master switch (config `enabled`, volatile) - false = full passthrough. */
    On: boolean;
    /** Config `denyPatterns` - the refused git subcommands (volatile). */
    Deny: string[];
    /** Config `allowPatterns` - the allowed git subcommands (volatile). */
    Allow: string[];
    /** Config `strict` - deny EVERY git command (volatile). */
    Strict: boolean;
    /** The per-action allowlist (config `policy`, volatile) - the D6 block.
     *  Named `Verdicts` because `Allow` is already this guard's git
     *  allow-list; the guard is read-only, so its own classes are
     *  `read`/`record` (automatic) and the write/commit/spawn verdicts stay
     *  the shipped `approve`. */
    Verdicts: Allowlist;
    /** The injected factory instance (the State builder, the ledger, the
     *  exclusion match). */
    Factory: FactoryHandle;
}
export default interface State extends Base, Extra {
}
export {};
