/**
 * @module Library
 *
 * The entry module of @playform/ets-client-dsh-panel-family-host (the host
 * half of the UI family's panel).
 *
 * @remarks
 * Loader contract (cordis): `export const name` + `export const apply` +
 * `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }` - the ONLY named exports
 * in the tree; every other module is a nameless default export composed
 * Rust-style.
 *
 * The services (Documentation/Plans/UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-
 * TAILS.md, PHASE-7-PLAIN-FIELD-BRIDGE.md):
 *
 * - panelFamilyHost - tail(namespace, lines) + stats(), read-only.
 * - panelFamilyBridge - editFull(namespace, patch) over
 *   ctx.configEditor.edit(), the one trusted full-config write surface
 *   (secret namespaces refused).
 * - panelFamilyTrace - the D5 bus forwarder (on/ring), provided when
 *   ctx.trace exists.
 *
 * The Typert generation pipeline is documented as not reproducible from an
 * external package, so the services ship as plain cordis services; the
 * browser half (Source/Client.ts) forwards them through the generated
 * playformFamilyPanel Remote namespace (the documented residual). fiberPhases
 * come from the existing remote.pluginManager - no new endpoint.
 */
import Apply from "./Function/Apply.js";
import Version from "./Variable/Version.js";
export declare const name = "client-dsh-panel-family-host";
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logRoot: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    maxLines: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    ccrLog: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logRoot: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    maxLines: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    ccrLog: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, "plain">;
export { Version };
export declare const inject: string[];
/**
 * Apply: provide the three services and log the activation. Returns nothing
 * (the loader contract).
 */
export declare function apply(context: Parameters<typeof Apply>[0], config: Parameters<typeof Apply>[1]): void;
declare const _default: {
    name: string;
    apply: typeof apply;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logRoot: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        maxLines: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        ccrLog: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logRoot: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        maxLines: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        ccrLog: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
