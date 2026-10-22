export default interface Proposal {
    /** The operation identifier of the proposal (recursion prevention). */
    operation: string;
    /** The parent operation identifier ("(root)" for a root operation). */
    parent: string;
    /** The event category of the proposal ("tool" for a gated tool call). */
    category: string;
    /** The proposal kind - the policy table's lookup key. */
    kind: string;
    /** The target path the proposal acts on ("(none)" when it has one). */
    target: string;
    /** The declared contribution to the operation (the contributes check;
     *  empty means the operate family has not attached a record yet, and the
     *  obligation evaluates "n/a" rather than denied). */
    contribution: string;
    /** The actor's claimed authorized scope (globs; empty = unrestricted). */
    scope: string[];
    /** The declared preconditions (satisfied evaluated by the proposal's
     *  originator; undefined means unevaluable - the recovery table). */
    preconditions?: {
        name: string;
        satisfied: boolean;
    }[] | undefined;
    /** The actor / holder name the proposal runs on behalf of. */
    holder: string;
    /** True when the proposal record was attached by the operate family
     *  (arguments.proposal) - the strict reading; false when the gate
     *  synthesized a minimal proposal from a plain tool call (the lenient
     *  reading: the contributes obligation evaluates "n/a"). */
    declared: boolean;
}
