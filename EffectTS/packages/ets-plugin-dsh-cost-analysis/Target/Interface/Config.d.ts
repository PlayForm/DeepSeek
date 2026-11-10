/**
 * @module Config
 *
 * The validated shape the schema produces (Variable/Config.ts): one
 * readonly field per config field, the nested metrics block as its own
 * interface.
 *
 * @remarks
 * Every field is defaulted by the schema, so all of them are always present
 * after validation.
 */
/**
 * The analysis plugin's resolved configuration.
 */
export default interface Config {
    /**
     * The master switch.
     */
    readonly enabled: boolean;
    /**
     * The ledger's SQLite file path.
     */
    readonly databasePath: string;
    /**
     * The client name.
     */
    readonly client: string;
    /**
     * The analysis day window, in days.
     */
    readonly window: number;
    /**
     * The metric-family switches.
     */
    readonly metrics: Metrics;
    /**
     * Ledger enabled - write the durable log file.
     */
    readonly log: boolean;
    /**
     * The durable ledger file (one log per module).
     */
    readonly logFile: string;
}
/**
 * The five metric families the analysis command can render (sections 11, 12
 * and 16.2-16.4); each switch turns one family on or off.
 */
interface Metrics {
    /**
     * The credit family (Ring C, section 11).
     */
    readonly credit: boolean;
    /**
     * The effectiveness family (section 16.4).
     */
    readonly effectiveness: boolean;
    /**
     * The lines family (the churn, sections 16.2 and 17.3).
     */
    readonly lines: boolean;
    /**
     * The overhead family (section 12).
     */
    readonly overhead: boolean;
    /**
     * The cache family (section 16.4).
     */
    readonly cache: boolean;
}
export {};
