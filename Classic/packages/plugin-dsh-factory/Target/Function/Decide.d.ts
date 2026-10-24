import type Allowlist from "@Interface/Allowlist.js";
export default _default;
declare function _default(Policy: Allowlist, Action: keyof Allowlist): "auto" | "approve";
