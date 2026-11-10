/**
 * @module DefaultCheckSets
 *
 * The shipped check-set classification catalog (DATA, not code; the
 * live-containers DefaultCheckSets precedent, monitor role).
 *
 * @remarks
 * The same shape the `checksets` config cell holds: dict name -> spec. The
 * catalog is the default value of the `checksets` dict, so classification
 * works out of the box:
 *
 * - tsc - a double star then a slash then a `*` then `.ts`,
 *   `tsc --noEmit <path>` (fast);
 * - format - the same `.ts` glob, `npx prettier --check <path>` (fast);
 * - cargo - a double star then a slash then `Cargo.toml`,
 *   `cargo check` (slow);
 * - governance - a double star then a slash then `package.json`, linked (no
 *   re-run).
 *
 * THE ROLE SPLIT (the family's ownership law): the workspace-monitor hook
 * CLASSIFIES and RECORDES - the `command` templates are recorded for the
 * accountability trail and are NEVER executed here; the check execution
 * stays with the live-containers monitor (its G2 wrapper is the one
 * execution path, "one wrapper, two callers" would be violated otherwise).
 */
import type CheckSet from "@Interface/CheckSet.js";
declare const DEFAULT_CHECK_SETS: Record<string, CheckSet>;
export default DEFAULT_CHECK_SETS;
