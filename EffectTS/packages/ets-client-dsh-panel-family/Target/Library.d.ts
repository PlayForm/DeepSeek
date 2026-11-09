import Version from "./Variable/Version.js";
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
/** The empty host half - the Loader row exists to serve the client half. */
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
