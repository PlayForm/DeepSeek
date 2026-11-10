import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function: the factory-shaped State build, the durable
 * activation proof, the two opt-in Overpass arms, the human command, and the
 * `normalize-file` tool registration.
 *
 * @remarks
 *
 * Apply is a THIN MODULE WIRE-UP in the factory family's shape: it builds the
 * State through `Factory.State` (the cell unwrap, the shared mappings
 * Ledger<-logFile and Enabled<-log, and the module's own fields via the setup
 * `fields` map - factory SCHEME.md section 2.10), emits the durable activation
 * proof (the module's own string, via Factory.Append - the factory never owns
 * ledger strings), and registers the `normalize-file` TOOL.
 *
 * NO EVENT LISTENER - the family's first listener-less flavor, deliberately:
 * - There is no llm/stream registration: the trigger is an explicit agent
 *   tool call, not a model-output stream - the tool's call arguments are also
 *   name-exempt in the core's stream gate (Stream/Chunk + Stream/Block, beside
 *   `edit` and `raw-write`) because they carry a FILE PATH.
 * - There is no fs/observed registration either: a background rewriter would
 *   break the edit tool's old_string contract (the agent read bytes X, a
 *   rewriter silently changed them, the next edit fails or half-matches - the
 *   live lesson that made raw-write's verbatim default the right call) and
 *   interleave with the governance trio's bounded passes. The file-hook
 *   precedent (`normalize-tabs.sh`, a repair hook for a repair hook) is why
 *   the after-the-fact rewriting stays OUT; the design report ships the tool
 *   arm only and defers any watch arm until an edit-contract mechanism exists.
 *   Nothing runs without an explicit agent action - zero background activity.
 *
 * NOT factory machinery, used as-is:
 * - Factory.State + Factory.Append (the ledger) - the family pattern.
 * - Factory.Journal (P5) - the tool's count records route through the
 *   three-stage journal (shared sink / pre-bind buffer / per-State queue),
 *   best-effort: with no storage facility the records simply buffer or drop,
 *   and the human ledger stays the complete record.
 * - Factory.Write (the ONE shared write executor) is consumed inside the
 *   tool's pipeline (Function/Normalize), not here.
 * - Factory.Schema is not used for Config beyond the `shared: false` minimal
 *   block: the MODULE owns its Config (Variable/Config.ts defines the
 *   normalizer's own schema, `shared: false` plus the two knobs).
 *
 * The function returns NOTHING - never a value: the loader treats apply return
 * values specially, and a returned State object silently killed event delivery
 * (live-verified, plugin-development skill pitfall 16). Test probes read the
 * state through the `ctx.__pluginDshNormalizeFileState` attachment instead.
 *
 * `inject: ["pluginFactory", "fs", "tools"]` (Library.ts) - the factory is a
 * REQUIRED service; the loader's PENDING state handles the ordering (the
 * plugin loads only when every injected service exists), so bundle-layer order
 * never matters. `fs` + `tools` serve the tool (the registry receives the
 * definition; the fs service carries the read and write paths - the fs
 * VOCABULARY (FsTarget/FsWriteOutcome, the fs/write-intent and fs/observed
 * events) arrives type-only through the factory's own declarations, which
 * import @deepseek-ai/dsh-fs). Nothing else is injected: the ledger append is
 * the factory's own plain-fs exemption.
 *
 * THE EFFECT DELTA (R6, mirroring the R4 pinner pattern): the plugin's
 * long-lived Effect `Scope` is created synchronously right after the State
 * (`State.Scope = Effect.runSync(Scope.make())` - apply is a sync seam, and a
 * sync `Scope.make` run through `Effect.runSync` is fully synchronous, so no
 * async boundary is introduced). THE NORMALIZER HAS NO TYPED-EFFECT STAGE - it
 * registers no event listener and its whole behavior is the tool's exec (plain
 * async consumer code over the factory's Write plus the core's tables,
 * byte-identical with Classic), so no `Scope.provide` call site consumes the
 * scope and NO module span is added here. The field exists for the family's
 * uniform State shape and for any future Effect-native stage, which would
 * adopt it via `Scope.provide`. The loader does not close it - the normalizer's
 * disposal semantics stay the Classic ones (the tool unregisters with the
 * plugin's fiber; the Scope holds nothing).
 */
declare function _default(Context: Context, Options: Config): void;
