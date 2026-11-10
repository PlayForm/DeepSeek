import Schema from "@deepseek-ai/schemastery";
export default _default;
/**
 * @module Policy
 *
 * The SHARED policy-block builder (D6), the second module-level helper beside
 * `Schema`: `Policy()` returns the Schemastery block a consumer spreads into
 * its own schema -
 *
 *     Compose(false, { ..., policy: Policy() })
 *
 * @remarks
 *
 * The block carries ONE key per action class (read, index, record, suggest,
 * write, commit, spawn, message), each an enum of "auto" | "approve" whose
 * default is the D6 posture from `Variable/Policy` (read/index/record/suggest/
 * message = auto; write/commit/spawn = approve). It is VOLATILE as one
 * object: a policy flip commits hot, and the factory's State builder
 * re-reads the whole block into the consumer's mapped State field (the
 * family convention is `Allow`; the shared State's `Policy` is the global
 * policy FILE).
 *
 * EXPORTED as the module-level named `Policy` on the entry (`Library.ts`),
 * exactly like `Schema`: the loader needs the composed `Config` at
 * MODULE-EVALUATION time, before any context (and therefore any service
 * instance) exists. It is NOT a service method - the class surface stays at
 * the documented nineteen.
 *
 * The verdict LOOKUP is `Function/Decide` (`Decide(policy, action)`); this
 * module only builds the schema. The pack's `policy` section overrides these
 * defaults per action when a pack is resolved (the wiring is the next
 * refinement; the type already exists in @playform/lib-dsh-pack).
 */
/**
 * The policy block: one "auto" | "approve" verdict per action class.
 */
declare function _default(): Schema<NoInfer<Schemastery.ObjectS<NoInfer<{
    read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
}>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
    read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
}>>>, "volatile">;
