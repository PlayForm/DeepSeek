/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * durable activation proof, the listeners, and the tool registration.
 *
 * @remarks
 * L1 batch/proposed (emit, structural registration, host scope) is the
 * synchronous recorder. One proposal at a time: record it (a lower revision
 * than the recorded one is ignored), evaluate expiry, and evaluate the
 * auto-approve policy. An auto-approval is a pure in-memory decision: the
 * decision is recorded, emitted as batch/decision (the ingester and the live
 * view listen for it), and logged. No awaits, no I/O, no throws - a listener
 * failure logs and no-ops.
 *
 * THE POLICY GATE (D6): the policy block's `commit` verdict is the OUTER gate
 * in front of `autoApprove` (the INNER one). An `approve` verdict - the
 * shipped default - refuses the policy auto-approval and records the
 * byte-exact `decision held <id> (policy commit=approve)` line: the proposal
 * stays pending and waits for the user's batch_decision approval. The
 * precedence is policy approve > knob: the knob can never widen an approve
 * verdict, while a knob that is off still requires the user and writes no
 * held line.
 *
 * T1 batch_decision tool is the user's approve/deny/list entry point
 * (Function/Tool).
 *
 * THE DECISION IS THE HOOK'S PRODUCT, NOT THE INGESTER: the hook never
 * writes files. The ingester handoff happens through the service seam
 * (Interface/Siblings, resolved via Context.get at use time) from the tool
 * path, and event-side by the ingester listening for batch/decision. The
 * hook emits only; the emit dispatch is fire-and-forget by contract.
 *
 * THE EMIT DISCIPLINE: the batch/proposed listener is a synchronous recorder
 * - no awaits, no throws, no file I/O. The waterfall family is not touched by
 * this hook.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "@Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
