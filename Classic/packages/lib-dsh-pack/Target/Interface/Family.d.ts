import type Signal from "./Signal.js";
import type Target from "./Target.js";
export default interface Family {
    /** The family id (unqualified: the ledger's name). */
    id: string;
    /** Lower wins when two families match one call. */
    priority: number;
    /** The family's own confidence gate. */
    threshold: number;
    /** The path/pattern rules. */
    signals: Signal[];
    /** The companion set. */
    targets: Target[];
    /** The one-phrase caveat appended to the note ("" when the domain has none). */
    note: string;
    /** The long-tail family globs ([] when the domain has none). */
    familyGlobs: string[];
}
