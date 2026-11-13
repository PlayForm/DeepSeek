import type State from "../Interface/State.js";
export default _default;
/**
 * @module Domain
 *
 * The optional storage-domain open (P5), SHARED: one method for every
 * consumer that declares its own per-record domain (the batch state board,
 * the pattern registry, the live-containers monitors - and any future
 * flavor), so the define/open/recover posture is owned by the factory - the
 * same owner the journal arm (`Function/Open`) already has - and the caller
 * keeps only what is its own: its table schemas, its restore and its JSON
 * fallback.
 *
 * @remarks
 *
 * The posture is `Function/Open`'s (the journal arm), minus the journal
 * sink. The facility is the CALLER'S probe (`Facility` - the absent-facility
 * silent skip stays at the caller, which never calls this method without
 * one), the optional storage package stays off the module-load path through
 * the dynamic import (a module-level import of an unresolvable package would
 * crash the whole bundle load - the live-verified pitfall; zod is imported by
 * the CALLER, which builds the schemas), the domain is declared per-record
 * with `invalidRecords: "backup-and-skip"`, and the `compatibleVersions`
 * rule is the family's learned one: an explicit list wins; absent, a version
 * above 1 declares its immediate predecessor (`[Version - 1]`, the v2 open
 * contract) and a version-1 domain declares NO compatible predecessor at all
 * (the library rejects an entry that is not strictly BELOW the declared
 * version, so `[1]` against version 1 throws at load - the key is omitted,
 * never an empty list).
 *
 * The caller's `Tables` are its own RAW zod schemas (the table SCHEMAS stay
 * the module's own - the factory never owns them); the `domainTable` wrap
 * happens here, inside the dynamic-import scope, so the caller never imports
 * the optional storage package at all.
 *
 * On success the handle is returned and `Spec.Restore` has already run once
 * (the caller's recovery - a throw inside it is contained by the same catch,
 * exactly as when the open itself fails). On any throw the LOUD posture
 * fires exactly once: one best-effort ledger line through `Function/Append`
 * composed by the CALLER's `Line` (the ledger strings stay byte-identical -
 * the factory never owns them), and the method resolves `undefined` so the
 * caller runs its own JSON fallback. Best-effort and detached, like the
 * journal arm: never throws onto a caller path.
 */
declare function _default(State: State, Facility: unknown, Spec: {
    Name: string;
    Version: number;
    Tables: Record<string, unknown>;
    Compatible?: number[];
    Line: (Cause: unknown) => string;
    Restore?: (Handle: unknown) => void;
}): Promise<unknown>;
