import type FactoryHandle from "./Factory.js";
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
export default interface State extends Base, Extra {
}
export {};
