/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build (the
 * factory's cell unwrap plus the P10 volatile refresh), the durable
 * activation proof, the FOUR phase-1 listeners, and the wave-2 extension.
 *
 * @remarks
 * IMPLEMENTATION-DESIGN.md sections 2-6; the C2 additions are REGISTERED
 * here - every wave-2 behavior lives in its own Function module.
 *
 * The phase-1 listener set:
 *
 * - `L1 system-prompt/assemble` (waterfall, `next()` first, append-only): the
 *   ONE live section named `sectionName` whose body is every enabled block
 *   rendered inside the LIVE CONTAINER frame; global TTL cache when
 *   `refresh = "ttl"`; fail-open try/catch, a render failure skips the block
 *   and logs; the section carries `interpolate: false` so only the plugin's
 *   own engine resolves its `{{token}}` groups.
 * - `L4 tools/post-execute` (waterfall, plain registration): updates the
 *   counters the counter/gauge blocks read (last-tool timestamp, per-turn
 *   attempt counts) and marks event-trigger blocks dirty.
 * - `L8 agent/pre-step` (waterfall, plain): the user-message detection (the
 *   tool-coach precedent, `Apply.ts:456-490`) counts messages/turns, resets
 *   per-turn counters, and marks event-trigger blocks dirty.
 * - `L9 tools/change` (emit): clears every scope's section cache (the
 *   tool-coach L5 pattern).
 *
 * The WAVE-2 SET (appended; same disciplines):
 *
 * - `L2 tools/pre-execute` (waterfall): the detach decision arm (G1) - class
 *   rule, await marker, dedup, escalation, policy guards; on transform it
 *   starts the job and tags the exec.
 * - `L3 tools/execute` (waterfall): the carrier arm - a tagged exec returns
 *   the fabricated foreground result WITHOUT `next()`.
 * - `L6 jobs events subscription` (emit, host scope, filtered): the settled
 *   truth (completion + boards) and the deadline checkpoints.
 * - `L7 session/event` (emit, host scope): the report pickup (G5) and the
 *   completion delivery observer (I3 2.3).
 * - tools: `live_container_set` + `live_plant` (the per-agent surface).
 * - `systemPrompt.context`: the completion dynamic context (the I3 carrier).
 *
 * The WAVE-3 SET (appended; same disciplines - the live file monitors, C3):
 *
 * - `L11 fs/observed` (the factory's Wire, ROOT context): the enrollment +
 *   the version truth (watchlist-gated).
 * - `L6` (extended): the monitors settle fold runs before the boards.
 * - `L1` (extended): the monitors stanza is one part of the wave-2 section,
 *   after the boards and before the suggestions.
 * - tools: `live_monitor` + `live_monitor_check` (the monitor surface).
 * - effect: the P5-style monitor storage domain (own open, own recovery).
 *
 * THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
 * returns the downstream decision unchanged. FAIL-OPEN: every listener body
 * is one try/catch - on any error a `logger.warn` records it and the
 * downstream result is returned UNCHANGED. A live block never fails an
 * assembly.
 *
 * NOT factory machinery, deliberately: no `fs/observed` Wire, no Attach, no
 * factory Schema - the plugin owns its schema (`Variable/Config`) and its
 * strings. The function returns NOTHING; test probes read the state through
 * the `ctx.__hookDshLiveContainersState` attachment.
 *
 * `inject: ["pluginFactory", "tools"]` (`Library.ts`) - the factory provides
 * the State builder + the ledger; `tools` is declared per the design's
 * phase-1 inject list (the wave-2 listeners consume it; phase 1 never
 * touches it).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
