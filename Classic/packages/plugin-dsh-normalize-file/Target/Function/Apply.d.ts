import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function, a THIN MODULE WIRE-UP in the factory family's
 * shape.
 *
 * @remarks
 *
 * The work is: build the State through `Factory.State` (the cell unwrap, the
 * shared mappings Ledger<-logFile / Enabled<-log and the module's own fields
 * via the setup `fields` map - factory SCHEME.md section 2.10), emit the
 * durable activation proof (the module's own string, via Factory.Append - the
 * factory never owns ledger strings), and register the `normalize-file` TOOL.
 *
 * NO EVENT LISTENER - the family's first listener-less flavor, deliberately:
 *
 * - There is no llm/stream registration: the trigger is an explicit agent tool
 *   call, not a model-output stream - the tool's call arguments are also
 *   name-exempt in the core's stream gate (Stream/Chunk + Stream/Block, beside
 *   `edit` and `raw-write`) because they carry a FILE PATH.
 * - There is no fs/observed registration either: a background rewriter would
 *   break the edit tool's old_string contract (the agent read bytes X, a
 *   rewriter silently changed them to X', the next edit fails or half-matches
 *   - the live lesson that made raw-write's verbatim default the right call)
 *   and interleave with the governance trio's bounded passes. The file-hook
 *   precedent (`normalize-tabs.sh`, a repair hook for a repair hook) is why
 *   the after-the-fact rewriting stays OUT; the design report ships the tool
 *   arm only and defers any watch arm until an edit-contract mechanism exists.
 *   Nothing runs without an explicit agent action - zero background activity.
 *
 * NOT factory machinery, used as-is:
 *
 * - Factory.State + Factory.Append (the ledger) - the family pattern;
 * - Factory.Journal (P5) - the tool's count records route through the
 *   three-stage journal (shared sink / pre-bind buffer / per-State queue),
 *   best-effort: with no storage facility the records simply buffer or drop,
 *   the human ledger stays the complete record;
 * - Factory.Write (the ONE shared write executor) is consumed inside the
 *   tool's pipeline (Function/Normalize), not here.
 * - Factory.Schema is not used for Config beyond the `shared: false` minimal
 *   block: the MODULE owns its Config (Variable/Config.ts defines the
 *   normalizer's own schema, `shared: false` + the two knobs).
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
 */
declare function _default(Context: Context, Options: Config): void;
