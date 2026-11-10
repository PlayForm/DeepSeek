import type CheckSet from "@Interface/CheckSet.js";
/**
 * @module DefaultCheckSets
 *
 * The shipped check-set classification catalog (DATA, not code; the
 * live-containers DefaultCheckSets precedent, monitor role).
 *
 * @remarks
 *
 * The same shape the `checksets` config cell holds: dict name -> spec. The
 * catalog is the default value of the `checksets` dict, so classification
 * works out of the box:
 *
 *   tsc        -> double star then *.ts       tsc --noEmit <path>          (fast)
 *   format     -> double star then *.ts       npx prettier --check <path>  (fast)
 *   cargo      -> double star then Cargo.toml  cargo check                (slow)
 *   governance -> double star then package.json  linked (no re-run)
 *
 * THE ROLE SPLIT (the family's ownership law): the workspace-monitor hook
 * CLASSIFIES and RECORDES - the `command` templates are recorded for the
 * accountability trail and are NEVER executed here; the check execution
 * stays with the live-containers monitor (its G2 wrapper is the one
 * execution path, "one wrapper, two callers" would be violated otherwise).
 */
/**
 * The shipped check-set classification catalog keyed by set name.
 */
declare const DEFAULT_CHECK_SETS: Record<string, CheckSet>;
export default DEFAULT_CHECK_SETS;
