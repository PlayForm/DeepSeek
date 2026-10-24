// SemanticsHandle - the slice of the workspace-semantics service the reflect
// consumes (Interface/Semantics): the service's per-adapter rename plan. The
// reflect does NOT import the semantics package (the PoC stays
// self-contained); the handle is probed at use time through `ctx.get`, and an
// absent service leaves the textual whole-word engine in charge.
import type Plan from "@Interface/Plan.js";
import type Span from "@Interface/Span.js";

export default interface SemanticsHandle {
	/** The per-adapter rename plan for the identifier at `span`; undefined is
	 *  the service's refusal-to-guess answer. */
	rename(path: string, span: Span, to: string): Promise<Plan | undefined>;
}
