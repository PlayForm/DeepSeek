import type { Context } from "@deepseek-ai/cordis";
import Schema from "@deepseek-ai/schemastery";
export declare const name = "plugin-dsh-boot";
export declare const Config: Schema<Schemastery.ObjectS<NoInfer<{
    /** Package specifiers mounted after the harness's own rail is free. */
    mount: Schema<string[], string[], "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    /** Package specifiers mounted after the harness's own rail is free. */
    mount: Schema<string[], string[], "defined">;
}>>, "plain">;
export declare const apply: (Context: Context, Configuration?: {
    mount?: string[];
}) => void;
declare const _default: {
    name: string;
    apply: typeof apply;
    Config: Schema<Schemastery.ObjectS<NoInfer<{
        /** Package specifiers mounted after the harness's own rail is free. */
        mount: Schema<string[], string[], "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        /** Package specifiers mounted after the harness's own rail is free. */
        mount: Schema<string[], string[], "defined">;
    }>>, "plain">;
};
export default _default;
