import type { State as State } from "@playform/ets-base-dsh";
import type { Options as Options } from "@playform/ets-base-dsh";
import type { Context } from "@deepseek-ai/cordis";
export default _default;
declare function _default<Extra extends object = Record<string, unknown>>(Context: Context, Config: unknown, Setup: Options): State & Extra;
declare module "@deepseek-ai/cordis" {
    interface Events {
        /** Volatile config values committed into the running fiber without a remount. */
        "loader/volatile-update"(Paths: unknown): void;
    }
}
