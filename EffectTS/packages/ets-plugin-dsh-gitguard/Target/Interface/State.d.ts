import type FactoryHandle from "./Factory.js";
import type { State as Base } from "@playform/ets-plugin-dsh-factory";
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
export default interface State extends Base, Extra {
}
export {};
