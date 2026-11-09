/**
 * @module Index
 *
 * The indexFile body: gate, read, parse, store and ledger one file.
 *
 * @remarks
 * The body resolves through `ctx.fs.resolve` (the backend's own cwd, the session working
 * directory), stats and gates the file (enabled, exclude, include, file type, language,
 * size), reads and parses it, asks the semantics service for the file's references
 * (`Function/References` - the `references` edge's consumer wiring; no service means no
 * references edges), caps the node count, stores the record (mirror plus KV, awaiting the
 * pending open first), bumps the `indexRevision`, persists the meta record, and ledgers
 * the byte-exact `indexed <path> version <version> (<nodes> nodes, <edges> edges)` line.
 *
 * Every gate skip and every failure carries the byte-exact `skipped`/`failed` line and
 * the same reason in the outcome.
 */
import type Outcome from "../Interface/Outcome.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(StateRef: State, Path: string): Promise<Outcome>;
