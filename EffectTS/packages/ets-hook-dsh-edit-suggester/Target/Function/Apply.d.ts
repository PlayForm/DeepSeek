/**
 * @module Apply
 *
 * The plugin entry function: the State build, the durable activation proof, the learned
 * layer, and the two listeners of the edit suggester's surfaces.
 *
 * @remarks
 * The listener set is exactly two:
 *
 * 1. `tools/post-execute` (waterfall, plain registration): `next()` first, then the
 *    pack-independent workspace root (a foreign workspace abstains), the learning
 *    FOLLOW-THROUGH (an open note's companion named by this call is an accept; the window
 *    ages otherwise), the HISTORY candidates (the files touched right after this one in
 *    this workspace) as ONE synthetic family, the EXPLICIT pack when one exists, the
 *    base-aware existence filter (companions absent from all three bases are dropped),
 *    Detect, Score's gate, and ONE additionalContexts note naming the companions - never
 *    a content replacement.
 * 2. `agent/pre-step` (plain): the per-turn reset (touched paths, cooldowns, dedupe,
 *    counters, the open note) when a user message enters.
 *
 * THE HISTORY IS A PROJECTION UNIT, NOT A LISTENER FOLD: `session/event` is the durable,
 * all-agent seam, and the supported plugin-facing form of it is `ctx.sessionProjections` -
 * the registry subscribes to `session/event` ONCE and passes every committed event through
 * every registered unit's `apply` (Function/Unit is the unit, Function/Register installs
 * it through the optional `ctx.inject(['sessionProjections'], ...)` form). The suggester
 * therefore holds no subscription of its own and folds nothing in this listener: it reads
 * the per-session state at detection time through `stateOf(session, key)`
 * (Function/History). The current call's own `tool/call` is committed BEFORE dispatch -
 * it is the call's STARTED record, the one recovery reports as `TOOL_OUTCOME_UNKNOWN`
 * when no result follows - so the anchor's prior touches, and the anchor itself, are
 * already folded when this listener runs and NO post-execute append is needed (an append
 * would fold the current call twice and inflate every later co-touch count).
 *
 * THE CANDIDATES COME FROM THE AGENT'S OWN PREVIOUS TOOL CALLS: the listener reads the
 * session history and runs `Adjacent(touches, callPath)` to name the files that were
 * touched right after this one in this workspace. The literal built-in pack is NOT a
 * candidate source; the pack survives only as an EXPLICIT override
 * (`<repo>/.dsh/pack.yml` or the user layer), resolved with `builtin: false`. A workspace
 * with no history and no pack abstains (`abstained no-history  0.00`).
 *
 * THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through returns the
 * downstream decision unchanged. FAIL-OPEN: every listener body is one try/catch - on any
 * error a logger.warn records it and the downstream decision is returned UNCHANGED. A
 * note never fails a waterfall.
 *
 * THE NOTE NEVER TOUCHES CONTENT and never claims the Transform: it names the companions
 * that conventionally receive the same change; deciding the change is the model's (the
 * search consumer's refusal of the Transform node holds here).
 *
 * THE WORKSPACE GATE + THE EXISTENCE FILTER: the root is the PACK-INDEPENDENT repo root
 * (the nearest ancestor carrying `.git` or `package.json`, from the call path plus the
 * session cwd). A call outside any workspace has no history to mine here and abstains
 * (`abstained foreign-workspace`); a companion absent from all three bases is dropped
 * BEFORE the score (`abstained no-companions` when the winner's whole companion set is
 * gone). The pack's families come from the RESOLVED pack per call (Families(pack,
 * "edit")), so an explicit repo pack overrides the edit families without a restart.
 *
 * THE D8 LEARNING LAYER (completion spec 00-OVERVIEW D8 + 03-SUGGESTERS section 2): every
 * emitted note - and every gated silence worth learning from (`low-confidence`,
 * `already-touched`) - records a DECISION through Function/Decide: the family, the
 * companion rows with their six pickable heuristic values, the effective weight table and
 * the enabled list, and the `pending` outcome placeholder. The record is stored through
 * the optional pattern service (`ctx.get("pattern")`, probed per use, never injected) and
 * in the bounded memory fallback otherwise (Function/Store). The note opens a
 * follow-through window; a later call that names a companion is an ACCEPT for that
 * companion and its family, and a window that reaches `learnWindow` judged calls
 * untouched is a soft REJECT - both fill the record's outcome and move the learned rates
 * the `history`/`accept` heuristics read.
 *
 * NOT factory machinery, deliberately: no fs/observed Wire, no Attach, no factory Schema
 * - the suggester owns its schema (Variable/Config) and its strings. The function returns
 * NOTHING; test probes (the end-phase) read the state through the
 * `ctx.__hookDshEditSuggesterState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
