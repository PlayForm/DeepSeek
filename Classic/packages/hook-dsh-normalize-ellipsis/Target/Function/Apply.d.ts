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
 * It builds the State through `Factory.State` (the cell unwrap, the shared
 * mappings Ledger<-logFile / Enabled<-log and the module's own fields via the
 * setup `fields` map - factory `SCHEME.md` section 2.10), emits the durable
 * activation proof (the module's own string, via `Factory.Append` - the
 * factory never owns ledger strings), and registers the ellipsis hook's OWN
 * `llm/stream` listener.
 *
 * NOT factory machinery, deliberately:
 *
 * - `Factory.Wire` is fs/observed-hardwired (the family's SILENCE) - the
 *   ellipsis hook's normalization must be VISIBLE (it IS the feature), so the
 *   registration here is the plain `ctx.on("llm/stream", ...)` pattern,
 *   fiber-owned, removed on unload, no manual bookkeeping.
 * - `Factory.Attach` (P1 jobs controller, P2 inflight disposal, P5 storage
 *   domain) has no consumer here: the ellipsis hook runs no jobs and holds no
 *   inflight continuations; its only journal traffic is the stream count
 *   record - the `normalized` event of the shared governance domain, journaled
 *   best-effort when the storage facility is present (`Function/Normalize`;
 *   the human ledger stays the complete record).
 * - `Factory.Schema` is not used for Config: it hardcodes the family's shared
 *   block (updateCooldownMs/mutationTools/policyFile/exclude - fs/observed
 *   machinery the ellipsis hook has none of). The MODULE owns its Config:
 *   `Variable/Config.ts` defines the ellipsis hook's own schema.
 *
 * The function returns NOTHING - never a value: the loader treats apply return
 * values specially, and a returned State object silently killed event
 * delivery (live-verified, plugin-development skill pitfall 16). Test probes
 * read the state through the `ctx.__hookDshEllipsisState` attachment instead.
 *
 * `inject: ["pluginFactory"]` (`Library.ts`) - the factory is a REQUIRED
 * service; the loader's PENDING state handles the ordering (the plugin loads
 * only when the factory service exists), so bundle-layer order never matters.
 * Nothing else is injected: the ledger append is the factory's own plain-fs
 * exemption, and the chunk vocabulary arrives through the waterfall, not
 * through an import.
 */
declare function _default(Context: Context, Options: Config): void;
