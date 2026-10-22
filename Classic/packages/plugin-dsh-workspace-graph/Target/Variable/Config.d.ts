import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    domain: Schema<string, string, "volatile-defined">;
    languages: Schema<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
    include: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    exclude: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    maxFileBytes: Schema<number, number, "volatile-defined">;
    maxNodesPerFile: Schema<number, number, "volatile-defined">;
    limitDefault: Schema<number, number, "volatile-defined">;
    limitMaximum: Schema<number, number, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    domain: Schema<string, string, "volatile-defined">;
    languages: Schema<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
    include: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    exclude: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    maxFileBytes: Schema<number, number, "volatile-defined">;
    maxNodesPerFile: Schema<number, number, "volatile-defined">;
    limitDefault: Schema<number, number, "volatile-defined">;
    limitMaximum: Schema<number, number, "volatile-defined">;
}>>, "plain">;
export default _default;
