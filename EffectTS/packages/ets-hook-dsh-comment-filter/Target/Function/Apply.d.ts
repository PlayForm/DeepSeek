/**
 * @module Apply
 *
 * The plugin entry function: a thin module wire-up in the factory family's
 * shape that builds the State, emits the durable activation proof, registers
 * the comment filter's TWO listeners on the current fiber and attaches the
 * State for the smoke probes.
 *
 * @remarks
 * The State is built through `Factory.State` (the cell unwrap, the shared
 * mappings Ledger<-logFile / Enabled<-log and the module's own fields via
 * the setup `fields` map - factory SCHEME.md section 2.10); the durable
 * activation proof is the module's own string, via Factory.Append - the
 * factory never owns ledger strings.
 *
 * THE TWO LISTENERS (both fiber-owned: removed on unload, no manual
 * bookkeeping, ever):
 * 1. tools/post-execute - the OVERPASS ARM, PREPENDED like the family's
 *    other arms (the CCR hook's prepended listener must see the FILTERED
 *    bytes so its size stats describe what the model actually sees; the
 *    core's CCR marker guard makes any load order safe regardless). The arm
 *    strips comments from `read` and `ccr_retrieve` results, gated per call
 *    by Function/Gate.
 * 2. agent/pre-step - the INTENT STASH (Function/Intent): the last user
 *    message's text, lowercased, per agent - the task intent the gate
 *    consults. It must exist even when `intent` is off (a volatile flip
 *    later lands without re-registration; the Gate reads the refreshed cell
 *    per call).
 *
 * NOT factory machinery, deliberately:
 * - Factory.Wire is fs/observed-hardwired (the family's SILENCE) - the
 *   comment filter has no fs machinery at all; its registrations are the
 *   plain `ctx.on(...)` pattern.
 * - Factory.Attach (jobs controller, inflight disposal, storage domain) has
 *   no consumer: the plugin runs no jobs, holds no continuations, and its
 *   only journal traffic is the core arm's best-effort `normalized` record.
 * - Factory.Schema is not used for Config: it hardcodes the family's shared
 *   block (fs/observed machinery this module has none of). The MODULE owns
 *   its Config: Variable/Config.ts.
 *
 * THE CORE ADAPTER: `State.Scopes` is pinned to `{ toolResults: true }`. The
 * shared ToolResults arm factory reads that cell as its own scope gate, and
 * this flavor has no scope vocabulary - the per-call Gate is the single
 * decision point - so the adapter keeps the core gate OPEN. One module-level
 * frozen object serves every apply; it is never mutated (the factory's
 * volatile refresh only writes fields named in the `fields` map, and this is
 * not one).
 *
 * The function returns NOTHING - never a value: the loader treats apply
 * return values specially, and a returned State object silently killed event
 * delivery (live-verified, plugin-development skill pitfall 16). Test probes
 * read the state through the `ctx.__hookDshCommentFilterState` attachment
 * instead.
 *
 * `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
 * service; the loader's PENDING state handles the ordering (the plugin loads
 * only when every injected service exists), so bundle-layer order never
 * matters. Nothing else is injected: the tool-result vocabulary arrives
 * through the merged Events declaration, and the agent-step payload through
 * the harness's own event augmentation.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
