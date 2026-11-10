import type { Context } from "@deepseek-ai/cordis";
import type { Options, State } from "@playform/ets-base-dsh";
export default _default;
/**
 * @module State
 *
 * The State builder: `State(ctx, config, { module, fields, policyFileName? })`.
 *
 * @remarks
 *
 * Defensive cell unwrap (Function/Unwrap - volatile Schemastery cells), the FIXED shared field
 * mappings (Tool from mutationTools, Policy from policyFile, Ledger from logFile, Enabled from
 * log, List from exclude), the module's own fields copied by the `fields` map (StateKey to
 * configKey), and the shared machinery structures: Stash (idempotence gate), Inflight (P2
 * disposal), Seams (probe-once cache), Queue + Journal (the P5 pre-open sink) - plus the P9
 * probe-once "subprocess" seam through Function/Seam.
 *
 * The optional `journalDomain` setup option (intersected onto the JournalService's Options type
 * here, since the base Options type is shared) transfers to State.JournalDomain (Function/Open's
 * P5 domain name); the shared "package_governance" fallback lives in Function/Open, so a module
 * that does not set the option keeps its behavior.
 *
 * Returns the SHARED shape intersected with the module's extra fields (`State & Extra`) - the
 * caller names its own extras type. Never returned from `apply` itself: the loader treats apply
 * return values specially, and a returned State object silently killed event delivery
 * (live-verified 2026-10-03); modules expose state via a context attachment instead.
 *
 * P10 - THE VOLATILE REFRESH: the builder additionally retains the RAW config's volatile cells
 * (`{ get }` references - Unwrap still produces the initial plain values) and registers ONE
 * instance-local `loader/volatile-update` listener on the module's own context (the event is
 * dispatched to the owning fiber only, so the listener belongs here -
 * docs/cordis-api/inherited.md:38). The payload is "the changed paths as arrays of keys"
 * (docs/cordis-tutorial/05-config.md:90); the listener keys each path on its TOP-LEVEL key
 * (robust to either the key-array or the dotted-string notation), maps it to a State field
 * through the FIXED shared mappings plus the module's own `fields` map inverted, and refreshes
 * that field IN PLACE from the retained cell - object identity preserved, no remount, no new
 * activation line, zero consumer changes. A failed refresh keeps the previous value (the same
 * defensive rule as the initial unwrap); unknown or non-volatile key paths are ignored.
 */
declare function _default<Extra extends object = Record<string, unknown>>(Context: Context, Config: unknown, Setup: Options & {
    journalDomain?: string | undefined;
}): State & Extra;
declare module "@deepseek-ai/cordis" {
    interface Events {
        /**
         * Volatile config values committed into the running fiber without a remount.
         */
        "loader/volatile-update"(Paths: unknown): void;
    }
}
