import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of @playform/ets-client-dsh-panel-family (the central
 * panel package of the UI family).
 *
 * @remarks
 *
 * Loader contract (cordis): `export const name` + `export const apply` +
 * `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }`.
 *
 * The host half is empty by design (Documentation/Plans/UI-Family/
 * PHASE-ADAPTERS-AND-LEDGER-TAILS.md companion decision, PHASE-2 section 1):
 * the Loader row exists only so the client module system serves this
 * package's `./client` half. apply() returns nothing and registers nothing:
 * the panel lives entirely in the browser (Source/Client.ts), and the package
 * is a pure client package - installing it needs no host restart (R-UI-1
 * finding). The Typert endpoint (tail/stats) lives in the companion package
 * @playform/ets-client-dsh-panel-family-host, not here.
 *
 * The Config schema (Source/Variable/Config.ts) still ships here because the
 * loader validates the exported schema while the plugin loads and the panel's
 * knobs (enabled, tabOrder, overlayMaxWidth, locale) are the package's own
 * tunables; the client half reads them through the validated config object
 * that the Loader row carries.
 */
export declare const name = "client-dsh-panel-family";
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    overlayMaxWidth: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    locale: import("@deepseek-ai/schemastery").default<"en" | "zh", "en" | "zh", "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    overlayMaxWidth: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    locale: import("@deepseek-ai/schemastery").default<"en" | "zh", "en" | "zh", "volatile-defined">;
}>>, "plain">;
export { Version };
export declare const inject: string[];
/**
 * The empty host half - the Loader row exists to serve the client half.
 */
export declare function apply(): void;
declare const _default: {
    name: string;
    apply: typeof apply;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        overlayMaxWidth: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        locale: import("@deepseek-ai/schemastery").default<"en" | "zh", "en" | "zh", "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        overlayMaxWidth: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        locale: import("@deepseek-ai/schemastery").default<"en" | "zh", "en" | "zh", "volatile-defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
