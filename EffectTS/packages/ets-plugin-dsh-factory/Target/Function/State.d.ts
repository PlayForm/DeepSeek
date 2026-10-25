import type { Context } from "@deepseek-ai/cordis";
import type { Options, State } from "@playform/ets-base-dsh";
declare const _default: <Extra extends object = Record<string, unknown>>(Context: Context, Config: unknown, Setup: Options & {
    journalDomain?: string | undefined;
}) => State & Extra;
export default _default;
declare module "@deepseek-ai/cordis" {
    interface Events {
        /** Volatile config values committed into the running fiber without a remount. */
        "loader/volatile-update"(Paths: unknown): void;
    }
}
