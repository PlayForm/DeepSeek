import type Outcome from "../Interface/Outcome.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Index
 *
 * The indexFile body: resolve, stat, gate, read, parse, ask for references,
 * store and ledger one byte-exact line.
 *
 * @remarks
 *
 * The resolve goes through ctx.fs.resolve (the backend's own cwd, the session
 * working directory). The gates are enabled, exclude, include, file type,
 * language and size. After the read and the parse the body ASKS THE SEMANTICS
 * SERVICE for the file's references (Function/References - the `references`
 * edge's consumer wiring; no service means no references edges), caps the
 * node count, stores the record (mirror + KV, awaiting the pending open
 * first), bumps the indexRevision, persists the meta record, and ledgers the
 * byte-exact
 * `indexed <path> version <version> (<nodes> nodes, <edges> edges)` line.
 * Every gate skip and failure carries the byte-exact `skipped`/`failed` line
 * and the same reason in the outcome.
 */
declare function _default(StateRef: State, Path: string): Promise<Outcome>;
