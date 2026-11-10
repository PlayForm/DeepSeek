/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the fs/observed listener and the
 * own storage effect.
 *
 * @remarks
 * The State build is the factory's cell unwrap plus the P10 volatile refresh;
 * the service registration is Function/Service (`workspaceEvidence`,
 * constructed here so `ctx.workspaceEvidence` resolves); the fs/observed
 * listener is the factory's Wire on the ROOT context - the invalidation seam.
 * The contract is EVIDENCE.md.
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
 * registers the service (it answers honestly: a validate() fails loud with
 * `evidence: service is disabled (enabled=false)`, an invalidate() finds
 * nothing), and wires NOTHING - no listener, no storage effect, no events
 * consumed.
 *
 * The function returns NOTHING (the loader contract: a returned value silently
 * kills event delivery). The test probe is the
 * `ctx.__pluginDshWorkspaceEvidenceState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
