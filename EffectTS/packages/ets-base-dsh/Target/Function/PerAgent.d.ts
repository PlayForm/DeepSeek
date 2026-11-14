export default _default;
/**
 * @module PerAgent
 *
 * The per-agent registry: one state object per agent, born on first use and
 * collected with the agent.
 *
 * @remarks
 *
 * A hook that keys state by the live agent object has three rules to get right,
 * and the family's copies disagreed on all three: the holder must be a WeakMap
 * (a strong Map keeps every agent alive for the session), the state must be
 * created lazily by the caller's own factory, and a call that carries no agent
 * must share ONE default key so the no-agent path still works.
 *
 * The registry returns the accessor, not the map: the module calls
 * `AgentOf(agent)` and receives its state. The WeakMap is private to the
 * closure, so no caller can hold, iterate or clear the entries - the lifetime
 * belongs to the agent object.
 *
 * Pure otherwise: no I/O, no clock, no timers.
 */
declare function _default<T>(Fresh: () => T): (Key: unknown) => T;
