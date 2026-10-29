export type Operation = "create" | "patch" | "support" | "archive" | "agreement";
/** One proposed operation. */
export interface Op {
    /** The operation kind. */
    op: Operation;
    /** The class-level skill name (kebab-case); for `agreement`, a stable label. */
    name: string;
    /** `support` only: the path under the skill (`references/<topic>.md`). */
    file?: string;
    /** The markdown to write (`create`/`patch`/`support`) or the rule text
     *  (`agreement`). `archive` carries none. */
    body?: string;
    /** One clause naming WHY - the rule's reason, never a session narrative. */
    reason?: string;
    /** `archive` only: the umbrella skill that absorbed this one. */
    absorbedInto?: string;
}
/** The parsed reply. */
export interface Proposal {
    ops: Op[];
    /** The reviewer's own one-line note (`"Nothing to save."` included). */
    note?: string | undefined;
}
/** The judge's per-operation verdict. */
export interface Verdict {
    /** Operations that may be applied (or queued, per the policy). */
    accepted: Op[];
    /** Operations the rules refused, each with the rule id that refused it. */
    rejected: {
        op: Op;
        rule: string;
    }[];
}
