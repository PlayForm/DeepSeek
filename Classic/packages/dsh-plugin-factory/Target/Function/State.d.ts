import type State from "@Interface/State.js";
import type Options from "@Interface/Options.js";
import type { Context } from "@deepseek-ai/cordis";
export default _default;
declare function _default<Extra extends object = Record<string, unknown>>(Context: Context, Config: unknown, Setup: Options): State & Extra;
