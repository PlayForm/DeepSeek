/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build (the
 * factory's cell unwrap plus the P10 volatile refresh), the service
 * registration (`Function/Service` - `workspaceGovern`), the activation proof,
 * and the gate listeners.
 *
 * @remarks
 * L1 `tools/pre-execute` (waterfall, next() first, fail-open envelope): the
 * gate arm - extract the proposal (the operate family's attached record, or the
 * minimal synthesis from the call itself), run the recursion guard, run the
 * four independent means-checks, and return the downstream decision UNCHANGED
 * on pass, the deny decision on deny, and the ask decision on escalate.
 *
 * L2 `tools/post-execute` (waterfall, plain observer): records the outcome of a
 * gated call in the ledger (`observed <operation> (accepted | errored)`) so the
 * gate's decision trail is auditable per call.
 *
 * THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
 * returns the downstream decision unchanged; FAIL-OPEN: every listener body is
 * one try/catch - on any error a logger line records it and the downstream
 * decision is returned UNCHANGED. A gate error never breaks a dispatch
 * (per-obligation failures are governed by the recovery table instead -
 * `Function/Recovery`).
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false. A cold mount logs
 * `disabled (enabled=false)` and wires NOTHING.
 *
 * The function returns NOTHING (the loader contract). The test probe is the
 * `ctx.__hookDshWorkspaceGovernState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
