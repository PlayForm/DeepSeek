/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the fs/observed listener, the
 * own storage effect, and the boot recovery pass.
 *
 * @remarks
 * The State build is the factory's cell unwrap + the P10 volatile refresh.
 * The service is Function/Service as `workspaceJournal`, constructed here so
 * `ctx.workspaceJournal` resolves. The contract is
 * Documentation/Plans/Workspace-Family/JOURNAL.md +
 * WORKSPACE-FAMILY-V4-1.md sections 3.7-3.8.
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
 * registers the service (it reads honestly from the empty state), and wires
 * NOTHING - no listener, no storage effect, no recovery pass.
 *
 * The function returns NOTHING (the loader contract: a returned value
 * silently kills event delivery). The test probe is the
 * `ctx.__hookDshWorkspaceJournalState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
