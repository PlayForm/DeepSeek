import type { Context } from "@deepseek-ai/cordis";
import type Options from "../Interface/Options.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module State
 *
 * The State builder (`Function/State` in the service API):
 * `State(ctx, config, { module, fields, policyFileName? })`.
 *
 * @remarks
 *
 * Defensive cell unwrap (`Function/Unwrap` - volatile Schemastery cells), the
 * FIXED shared field mappings (Tool<-mutationTools, Policy<-policyFile,
 * Ledger<-logFile, Enabled<-log, List<-exclude), the module's own fields
 * copied by the `fields` map (StateKey -> configKey), and the shared
 * machinery structures: Stash (idempotence gate), Inflight (P2 disposal),
 * Seams (probe-once cache), Queue + Journal (the P5 pre-open sink) - plus
 * the P9 probe-once "subprocess" seam through `Function/Seam`.
 *
 * The optional `journalDomain` setup option transfers to State.JournalDomain
 * (`Function/Open`'s P5 domain name); the shared "package_governance"
 * fallback lives in `Function/Open`, so a module that does not set the
 * option keeps its behavior.
 *
 * The optional `updates` setup option (v0.2 - the update-stage machinery's
 * birth): a module that runs the update stage (the core's
 * `lib-dsh-core/Function/Update` Dispatch/Settle pair) sets it and receives
 * the per-directory machinery BORN on its State - Stamp (cooldown), Set
 * (in-flight) and Count (circuit breaker) as FRESH instances built at
 * State-build time, per mount, never module-level. When the option is
 * absent or false the three fields are not added and the shape stays as it
 * is for every other module.
 *
 * The optional `counter` setup option (the declared counter): a module that
 * owns a monotonic sequence or revision sets it and receives the core's
 * `lib-dsh-core/Function/Counter` BORN on its State at State-build time -
 * `Value` (the read-only current number), `Next` (the only way to advance)
 * and `Restore` (raise and never lower - the core's `Resume` rule carried by
 * the counter itself) as a FRESH instance per mount, never module-level.
 * When the option is absent or false the field is not added and the shape
 * stays as it is for every other module.
 *
 * Returns the SHARED shape intersected with the module's extra fields
 * (`State & Extra`) - the caller names its own extras type. Never returned
 * from `apply` itself: the loader treats apply return values specially, and
 * a returned State object silently killed event delivery (live-verified
 * 2026-10-03); modules expose state via a context attachment instead.
 *
 * P10 - THE VOLATILE REFRESH: the builder additionally retains the RAW
 * config's volatile cells (`{ get }` references - Unwrap still produces the
 * initial plain values) and registers ONE instance-local
 * `loader/volatile-update` listener on the module's own context (the event is
 * dispatched to the owning fiber only, so the listener belongs here -
 * docs/cordis-api/inherited.md:38). The payload is "the changed paths as
 * arrays of keys" (docs/cordis-tutorial/05-config.md:90); the listener keys
 * each path on its TOP-LEVEL key (robust to either the key-array or the
 * dotted-string notation), maps it to a State field through the FIXED shared
 * mappings plus the module's own `fields` map inverted, and refreshes that
 * field IN PLACE from the retained cell - object identity preserved, no
 * remount, no new activation line, zero consumer changes. A failed refresh
 * keeps the previous value (the same defensive rule as the initial unwrap);
 * unknown or non-volatile key paths are ignored.
 */
declare function _default<Extra extends object = Record<string, unknown>>(Context: Context, Config: unknown, Setup: Options): State & Extra;
declare module "@deepseek-ai/cordis" {
    interface Events {
        /**
         * Volatile config values committed into the running fiber without a remount.
         */
        "loader/volatile-update"(Paths: unknown): void;
    }
}
