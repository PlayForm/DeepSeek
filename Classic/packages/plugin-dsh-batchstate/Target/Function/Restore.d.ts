import type File from "../Interface/File.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Restore
 *
 * The shared recovery: it repopulates the members, the queue, the spliced proposals and the arbiter
 * gates from ONE state-shaped source and ledgers the recovery line.
 *
 * @remarks
 *
 * The source is the KV domain's four tables OR the JSON fallback file (Interface/File); the ledger
 * line is the byte-exact `recovered (<n> members, queue <n>)`.
 *
 * THE MERGE (not a replace): at mount the live collections are empty, so a merge and a replace are
 * the same thing - EXCEPT in the storage domain's open window, where a splice or a write API call
 * can land before the detached open resolves. The live record always WINS (it is the newer truth),
 * so an early activation or an early gate report is never clobbered by the store's older copy.
 *
 * THE RULES (unchanged from the file-only recovery):
 *
 * - a member KEEPS its status, timestamps and scope;
 * - a member that recovered as active is HONESTLY downgraded to interrupted (the process it ran in
 *   is gone after a restart - the live truth cannot be claimed; a LIVE member is not downgraded -
 *   its process exists);
 * - the queue keeps only ids that still have a member record;
 * - a malformed row is skipped, never guessed;
 * - the proposals and the gates come back verbatim - the board's proposal memory and the arbiter
 *   truth survive the restart.
 */
declare function _default(State: State, Source: File): void;
