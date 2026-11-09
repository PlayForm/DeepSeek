/**
 * @module Store
 *
 * Provides the learned layer's storage: the accept rates and the decision records.
 *
 * @remarks
 * The accept rates the score reads, the outcome writes the follow-through performs, and the
 * decision-record memory (completion spec D8 + 03-SUGGESTERS section 2).
 *
 * THE PRIMARY IS THE SHARED PATTERN SERVICE, PROBED PER USE (`ctx.get("pattern")`, NEVER AN
 * INJECT): the service is optional and may load after this plugin, so the probe runs on
 * every read/write and a missing service is simply the fallback. The service's own Record
 * moves a record's confidence by its configured accept bonus / reject penalty; this leaf
 * seeds the record at the current rate before the first outcome, so a new record moves from
 * the neutral 1/3 exactly like the memory fallback. A service that cannot answer
 * `Get`/`Put`/`Record` (a partial or foreign implementation) is treated as absent.
 *
 * WHY `Get` AND NOT `Match`: every learned record has an EXACT id (below), so `Get` is the
 * honest read. `Match` ranks by keyword overlap and abstains under its own
 * threshold/ambiguity rules - and it answers the empty result when the service ships
 * disabled (its documented idle posture) - so a Match-based read would hide the learned
 * state instead of reporting it. `Record` is still the write that moves a record (the
 * service owns the outcome arithmetic).
 *
 * THE FALLBACK IS AN IN-MEMORY, BOUNDED STORE (config `storeLimit`, default 512): the same
 * arithmetic (accept +0.1, reject -0.2, clamped to 0..1, the pattern service's documented
 * defaults), keyed by the same ids, evicting the oldest entry when the bound is reached. It
 * is PER INSTANCE by design - a reopen starts neutral, which is why the durable path is
 * the service.
 *
 * THE KEYS (deterministic, module-scoped so two suggesters never collide):
 *
 * - `<module>:family:<Family>` - the family's learned rate;
 * - `<module>:companion:<Path>` - the companion's learned rate;
 * - `<module>:decision:<Family>:<sorted paths joined by |>` - the decision record.
 *
 * THE DECISION RECORD is stored as a pattern when the service is present: the family is the
 * intent, the companion paths are the targets, the outcome is the arbiter, the kappa is the
 * confidence, and the transform lines carry the weight table, the enabled list and one
 * `path <values>` line per companion (the pattern schema is the read-only contract, so the
 * record is projected onto its string fields rather than extending it).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Learning from "../Interface/Learning.js";
export default _default;
declare function _default(
/**
 * The plugin context (the optional service probe).
 */
Context: Context, 
/**
 * The module id (the key prefix and the rate records' arbiter).
 */
Module: string, 
/**
 * The memory fallback's bound (config `storeLimit`).
 */
Limit: number): Learning;
