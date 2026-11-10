/**
 * @module Apply
 *
 * The plugin entry function, a THIN MODULE WIRE-UP in the factory family's shape.
 *
 * @remarks
 * It builds the State through `Factory.State` (the cell unwrap, the shared mappings
 * Ledger<-logFile / Enabled<-log and the module's own fields via the setup `fields` map), emits
 * the durable activation proof (the module's own string, via Factory.Append - the factory never
 * owns ledger strings), and registers the hook's OWN listeners:
 *
 * 1. `tools/post-execute` (waterfall, plain ctx.on - AFTER the CCR `{prepend:true}` listener and
 *    normalize's post-execute): next() first, then the co-touch candidates of the session
 *    history, or - only when that history is empty - the EXPLICIT repo/user pack. It never
 *    replaces content, only adds contexts.
 * 2. `agent/pre-step` (waterfall, plain): the per-turn reset - the per-turn note counter when a
 *    user message enters (the tool-coach precedent).
 *
 * THE HISTORY IS A PROJECTION UNIT, NOT A LISTENER FOLD: `session/event` is the durable,
 * all-agent seam, and the supported plugin-facing form of it is `ctx.sessionProjections` - the
 * registry subscribes to `session/event` ONCE and passes every committed event through every
 * registered unit's `apply` (Function/Unit is the unit, Function/Register installs it through
 * the optional `ctx.inject(['sessionProjections'], ...)` form). The hook therefore holds no
 * subscription of its own and folds nothing in this listener: it reads the per-session state at
 * detection time through `stateOf(session, key)` (Function/History). The current call's own
 * `tool/call` is committed BEFORE dispatch - it is the call's STARTED record, the one recovery
 * reports as `TOOL_OUTCOME_UNKNOWN` when no result follows - so the anchor's prior touches, and
 * the anchor itself, are already folded when this listener runs and NO post-execute append is
 * needed (an append would fold the current call twice and inflate every later co-touch count).
 *
 * THE CANDIDATES COME FROM THE AGENT'S OWN PREVIOUS TOOL CALLS: the unit folds every committed
 * `tool/call` that names a path (reads included) through the pack library's `Fold`, and the
 * listener runs `Adjacent(touches, callPath)` to name the files that were touched right after
 * this one in this workspace. The literal built-in pack is NOT consulted; the pack survives only
 * as an EXPLICIT override (`<repo>/.dsh/pack.yml` or the user layer), resolved with
 * `builtin: false`. A packless workspace with no history abstains (`abstained no-history`).
 *
 * THE LEARNING BOOTSTRAP IS RETIRED: the literal learner is no longer called (the learner and
 * its source files were removed) and the config's `learning` field is kept only for
 * compatibility.
 *
 * THE WATERFALL DISCIPLINE (the ccr/tool-coach precedent, live-verified):
 *
 * - `next()` is ALWAYS awaited FIRST, before any decision;
 * - pass-through is `return decision` unchanged;
 * - FAIL-OPEN: every listener body is one try/catch - on any error a logger.warn records it and
 *   the downstream decision is returned UNCHANGED. A note never fails a tool call.
 *
 * THE WORKSPACE GATE + THE EXISTENCE FILTER: the root is the PACK-INDEPENDENT repo root (the
 * nearest ancestor carrying `.git` or `package.json`, from the call path plus the session cwd).
 * A call outside any workspace abstains (`abstained foreign-workspace`); a target absent from
 * all three bases is dropped BEFORE the gate (`abstained no-companions` when the intent's whole
 * target set is gone). The pack's intents come from the RESOLVED pack per call
 * (Families(pack, "convention")), compiled once per root, so an explicit repo pack overrides the
 * pack intents without a restart.
 *
 * NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no factory Schema - the
 * hook owns its schema (Variable/Config.ts) and its strings. The function returns NOTHING (a
 * returned value silently kills event delivery, live-verified).
 *
 * `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED service (the State
 * builder + the ledger); the loader's PENDING state handles the ordering, so bundle-layer order
 * never matters. The projection registry is deliberately NOT declared there: it is an OPTIONAL
 * seam the hook registers on through `ctx.inject` and reads through `ctx.get`, so a mount
 * without it still loads (Function/Register, Function/History).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
