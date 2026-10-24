import type Plan from "./Plan.js";
import type Span from "./Span.js";
export default interface SemanticsHandle {
    /** The per-adapter rename plan for the identifier at `span`; undefined is
     *  the service's refusal-to-guess answer. */
    rename(path: string, span: Span, to: string): Promise<Plan | undefined>;
}
