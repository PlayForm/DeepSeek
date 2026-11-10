/**
 * @module Contract
 *
 * The observe hook's side of the trace contract: the ONE event it emits,
 * `observe/stamp`, carrying the recorded stamp's path, version and origin.
 *
 * @remarks
 * The hook's own monotonic sequence stays private - the trace does not carry
 * it. The draft is completed by the bus (Function/Complete in
 * @playform/ets-lib-dsh-trace).
 */
import type Stamp from "../Interface/Stamp.js";
import { type Draft } from "@playform/ets-lib-dsh-trace";
export default _default;
declare function _default(Stamp: Stamp): Draft;
