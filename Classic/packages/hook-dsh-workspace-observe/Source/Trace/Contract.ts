import type Stamp from "@Interface/Stamp.js";
import { Names, type Draft } from "@playform/lib-dsh-trace";

/**
 * @module Contract
 *
 * The observe hook's side of the trace contract: the ONE event it emits,
 * `observe/stamp`.
 *
 * @remarks
 *
 * The event carries the recorded stamp's path, version and origin (the hook's
 * own monotonic sequence stays private - the trace does not carry it). The
 * draft is completed by the bus (Function/Complete in
 * @playform/lib-dsh-trace).
 */
export default (Stamp: Stamp): Draft => ({
	kind: Names.observe,
	payload: {
		path: Stamp.path,
		version: Stamp.version,
		origin: Stamp.origin,
	},
});
