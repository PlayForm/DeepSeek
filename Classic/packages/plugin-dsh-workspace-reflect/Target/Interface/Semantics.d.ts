import type Plan from "@Interface/Plan.js";
import type Span from "@Interface/Span.js";
export default interface SemanticsHandle {
    /** The per-adapter rename plan for the identifier at `span`; undefined is
     *  the service's refusal-to-guess answer. */
    rename(path: string, span: Span, to: string): Promise<Plan | undefined>;
}
