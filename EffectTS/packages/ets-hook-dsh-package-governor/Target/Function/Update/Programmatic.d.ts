import type Invocation from "@Interface/Invocation.js";
import type State from "@Interface/State.js";
export default _default;
/**
 * @module Programmatic
 *
 * The DEFAULT update mode: the npm-check-updates library, run in-process.
 *
 * @remarks
 *
 * The library is declared as a bundle dependency; the harness auto-installs
 * plugin dependencies into the profile. It runs via run(...) in-process inside
 * the detached update continuation - no external binary. THE npm-check-updates
 * library is one of the two standing exemptions: it is the one external
 * capability this plugin uses. Ledger lines go through the FACTORY
 * (State.Factory.Append - the continuation runs in the host process, so the
 * lines land in the same ledger directly instead of the old child's inherited
 * fd).
 */
declare function _default(State: State, Invocation: Invocation, Root: string, Groups: string[], Concurrency: number, Reject: string[], Allow: string[] | undefined): Promise<boolean>;
