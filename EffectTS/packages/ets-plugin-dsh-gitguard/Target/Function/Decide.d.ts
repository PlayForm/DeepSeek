import type Decision from "@Interface/Decision.js";
import type State from "@Interface/State.js";
export default _default;
/**
 * @module Decide
 *
 * The classifier: one terminal command -> the verdict.
 *
 * @remarks
 *
 * The guard chain (ORCHESTRATION-PLUGINS.md section 3):
 *
 * 1. the guard is disabled -> allow (the cold mount passes everything);
 * 2. NO segment of the command is a git command -> allow (the guard only ever judges git);
 * 3. strict mode -> deny (EVERY git command, allow-list included - the plan's "deny ALL git
 *    commands" posture; strict is the tighter override);
 * 4. a segment's subcommand is allow-listed -> allow (the read-only checks + fetch; the
 *    allow-list wins over the deny-list, so a user can re-allow a denied subcommand explicitly);
 * 5. a segment's subcommand is deny-listed -> deny;
 * 6. otherwise -> allow (not deny-listed).
 *
 * A compound command is judged by its WORST segment: any denied segment denies the whole command
 * ("cd repo && git add -A" is denied). The verdict carries the first denied subcommand for the
 * ledger/refusal.
 */
declare function _default(State: State, Command: string): Decision;
