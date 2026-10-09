// Actor — the structural view of the opaque actor the fs/* events carry
// (subsystems/filesystem.md: "an opaque `object` actor — no model-facing
// concepts"). The modules key off exactly one field: the tool name of the
// mutating actor, the same one-field narrowing `@deepseek-ai/dsh-fs` uses for
// its own `FsObservationActor` (it narrows `agent.session`; the gate narrows
// `name` because the trigger gate is the mutation-tool list). The narrowing
// is a cast at the use site — the event contract keeps the actor opaque, and
// a reader or absent actor produces `undefined`, which never matches the
// mutation-tool list.
//
// A second structural field exists: `govern` — the RAW-WRITE's marker. The
// tool's exec passes its actor to the shared executor WRAPPED as
// `{ ...exec, govern: <selection> }`, and the gate uses the field's mere
// PRESENCE (the value is informational) to skip the event-path governance:
// the raw-write's only governance channel is the factory's direct
// `Govern(target, selection)` path, so its fs/observed emits must never
// re-enter the chain. The built-in write/edit execs carry no such field and
// their events keep governing exactly as before.
export default interface Actor {
	/** The tool name of the mutating actor, when one is present. */
	name?: string;
	/** The raw-write's marker: any value here routes the write's governance
	 *  to the factory's direct `Govern` path exclusively (presence, not the
	 *  value, is what the gate checks). */
	govern?: unknown;
}
