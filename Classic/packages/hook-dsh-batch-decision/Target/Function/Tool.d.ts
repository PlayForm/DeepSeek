/**
 * @module Tool
 *
 * The `batch_decision` tool: the one entry point the user interacts with
 * (PASS-ON-AND-INGESTER.md section 5).
 *
 * @remarks
 * This file only BUILDS the definition (the CCR Retrieve.ts idiom); the
 * registration call lives in Apply. Verbs:
 * - (no args) - list pending proposals (id, intent, targets, expiry)
 * - id + approve=true - approve by user; hand off to the ingester seam
 * - id + approve=false - deny by user
 *
 * Unknown or already-decided ids log and no-op. The tool result is one
 * canonical JSON object; the renderer is pure.
 */
import type { Context } from "@deepseek-ai/cordis";
import type State from "@Interface/State.js";
export default _default;
declare function _default(Context_: Context, State_: State, Append: (Message: string) => void): import("@deepseek-ai/dsh-tools").ToolDefinition;
