import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of @playform/client-dsh-workspace-live (the workspace
 * family's live client).
 *
 * @remarks
 *
 * Loader contract (cordis): `export const name` + `export const apply` +
 * `export const Config` + `export const inject` + `export default { name,
 * apply, Config, inject }`.
 *
 * Like the central panel package, the host half of the entry is EMPTY: the
 * live view lives entirely in the browser (Source/Client.ts). The Loader row
 * exists so the client module system serves the ./client half. The Config
 * schema ships here because the loader validates it at load and the knobs
 * (enabled, tabOrder, maxEvents, maxRepresentations) are the package's own
 * tunables.
 *
 * THE ROLE (Documentation/Plans/Workspace-Family/LIVE.md): the presentation,
 * stable-until-event. The live view presents the workspace's representations
 * at the END of the invisible flow; it never re-renders continuously and
 * never conflates a running OS process with a managed entity.
 */
export declare const name = "client-dsh-workspace-live";
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    maxEvents: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    maxRepresentations: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    maxEvents: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    maxRepresentations: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
}>>, "plain">;
/**
 * The compiled package version (Source/Variable/Version, built in by the
 * ESBuild define) - NOT a loader key: the contract's four names (name, apply,
 * Config, inject) are unchanged, and the default object below stays exactly
 * { name, apply, Config, inject }.
 */
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
        maxEvents: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxRepresentations: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxEvents: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxRepresentations: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
