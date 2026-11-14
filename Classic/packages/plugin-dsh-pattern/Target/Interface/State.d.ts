import type { Context } from "@deepseek-ai/cordis";
import type FactoryHandle from "./Factory.js";
/**
 * @module State
 *
 * The pattern service's per-mount storage State: the slice the factory's
 * shared storage-domain open consumes.
 *
 * @remarks
 *
 * The pattern service is a CLASS-FORM service (no factory-built State
 * object), so this is the minimal record the service assembles at the
 * storage open - the shared `OpenDomain` method (`@playform/plugin-dsh-factory`,
 * `Function/Domain`) reads the logger (`Context`, `Module`), the domain
 * declaration (`DomainName`) and the failure line's suffix (`LogFile`) from
 * it, and the open routes through `Factory`. The config fields are rebuilt
 * from the live knobs at every open (never copied into a module-level
 * constant - the volatile-State rule), so a hot edit lands on the next open.
 */
export default interface State {
    /**
     * The host context: the loud failure line's logger.
     */
    Context: Context;
    /**
     * The ledger prefix: the module identity (`pattern: `).
     */
    Module: string;
    /**
     * Config `domain` - the KV domain name (read at call time).
     */
    DomainName: string;
    /**
     * Config `logFile` - the ledger line's suffix (read at call time).
     */
    LogFile: string;
    /**
     * The factory instance (the shared storage-domain open).
     */
    Factory: FactoryHandle;
}
