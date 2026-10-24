import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    domain: Schema<string, string, "volatile-defined">;
    languages: Schema<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
    include: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    exclude: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    maxFileBytes: Schema<number, number, "volatile-defined">;
    maxNodesPerFile: Schema<number, number, "volatile-defined">;
    maxFiles: Schema<number, number, "volatile-defined">;
    limitDefault: Schema<number, number, "volatile-defined">;
    limitMaximum: Schema<number, number, "volatile-defined">;
    policy: Schema<NoInfer<Schemastery.ObjectS<NoInfer<{
        read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
        read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    }>>>, "volatile">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    domain: Schema<string, string, "volatile-defined">;
    languages: Schema<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
    include: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    exclude: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    maxFileBytes: Schema<number, number, "volatile-defined">;
    maxNodesPerFile: Schema<number, number, "volatile-defined">;
    maxFiles: Schema<number, number, "volatile-defined">;
    limitDefault: Schema<number, number, "volatile-defined">;
    limitMaximum: Schema<number, number, "volatile-defined">;
    policy: Schema<NoInfer<Schemastery.ObjectS<NoInfer<{
        read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
        read: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        index: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        record: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        suggest: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        write: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        commit: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        spawn: Schema<"approve" | "auto", "approve" | "auto", "defined">;
        message: Schema<"approve" | "auto", "approve" | "auto", "defined">;
    }>>>, "volatile">;
}>>, "plain">;
export default _default;
