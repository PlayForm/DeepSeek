import type { Context } from "@deepseek-ai/cordis";
import { SuggestStore } from "@playform/lib-dsh-core";

import type Learning from "../Interface/Learning.js";
import Table from "./Table.js";

/**
 * @module Store
 *
 * Provides the learned layer's storage: the accept rates and the decision records.
 *
 * @remarks
 *
 * The accept rates the score reads, the outcome writes the follow-through performs, and the
 * decision-record memory (completion spec D8 + 03-SUGGESTERS section 2).
 *
 * The machinery lives in the core (`SuggestStore` of `@playform/lib-dsh-core`): the outcome
 * arithmetic (the neutral 1/3, accept +0.1, reject -0.2, clamped to 0..1), the bounded
 * memory fallback, the decision ring and the pattern projection are the core's. This file
 * binds the package's probe and state. THE PRIMARY IS THE SHARED PATTERN SERVICE, PROBED
 * PER USE (`ctx.get("pattern")`, NEVER AN INJECT): the service is optional and may load
 * after this plugin, so the probe runs on every read/write and a missing service is simply
 * the fallback. A service that cannot answer `Get`/`Put`/`Record` (a partial or foreign
 * implementation) is treated as absent. The service's own `Record` moves a record's
 * confidence by its configured accept bonus / reject penalty; the core seeds the record at
 * the neutral rate before the first outcome, so a new record moves exactly like the memory
 * fallback. The module id is this package's (the key prefix and the rate records' arbiter),
 * the bound is the config's `storeLimit`, the table composer is the package's `Table`, and
 * the stamp is the wall clock (the core keeps none).
 *
 * WHY `Get` AND NOT `Match`: every learned record has an EXACT id (the core's keys), so
 * `Get` is the honest read. `Match` ranks by keyword overlap and abstains under its own
 * threshold/ambiguity rules - and it answers the empty result when the service ships
 * disabled (its documented idle posture) - so a Match-based read would hide the learned
 * state instead of reporting it. `Record` is still the write that moves a record (the
 * service owns the outcome arithmetic).
 *
 * The default export stays the per-mount factory: every `Store()` call builds a fresh
 * machine, so the store is born in `apply` and dies with the mount.
 */

/**
 * One pattern record (the pattern service's serializable projection).
 */
interface Stored {
	/**
	 * The registry id.
	 */
	id: string;

	/**
	 * The intent label (the family id).
	 */
	intent: string;

	/**
	 * The trigger signals (the family id or the companion path, lowercased).
	 */
	trigger: { tool?: string | undefined; keywords: string[] };

	/**
	 * The target subgraph as paths (the companion set).
	 */
	targets: string[];

	/**
	 * The descriptions-only lines (the decision record's projection).
	 */
	transform: string[];

	/**
	 * The arbiter (the outcome for a decision record, the module for a rate).
	 */
	arbiter: string;

	/**
	 * The confidence in 0..1 (the learned rate, or the decision's kappa).
	 */
	confidence: number;

	/**
	 * The decision hook's eligibility hint (always false here).
	 */
	allowlist: boolean;

	/**
	 * Last write time, epoch ms.
	 */
	updatedAt: number;
}

/**
 * The structural view of the pattern service this leaf uses.
 */
interface Registry {
	/**
	 * One record by id.
	 */
	Get?: (Id: string) => Stored | undefined;

	/**
	 * Idempotent upsert by id.
	 */
	Put?: (Pattern: Stored) => void;

	/**
	 * The outcome move on one record.
	 */
	Record?: (Id: string, Outcome: "accepted" | "rejected") => void;
}

/**
 * The per-mount learning store: the core's machinery bound to this package's probe.
 */
export default (
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
	Limit: number,
): Learning =>
	SuggestStore(
		/**
		 * The per-use probe of the shared pattern service.
		 */
		(): Registry | undefined => {
			try {
				const Service = Context.get?.("pattern") as Registry | undefined;
				return typeof Service?.Get === "function" &&
					typeof Service.Put === "function" &&
					typeof Service.Record === "function"
					? Service
					: undefined;
			} catch {
				return undefined;
			}
		},
		Module,
		Limit,
		Table,
		() => Date.now(),
	);
