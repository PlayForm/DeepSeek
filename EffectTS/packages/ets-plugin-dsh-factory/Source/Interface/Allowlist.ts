// Allowlist - the shape of the SHARED policy block (D6): one key per action
// class a plugin can take, each valued "auto" (the plugin acts on its own) or
// "approve" (the action waits for the user's approval). This is the TYPE of
// the block; the defaults live in Variable/Policy.ts, the Schemastery builder
// is Function/Policy (the `Policy` named export of the entry), and the
// verdict lookup is Function/Decide (the `Decide` named export).
//
// THE EIGHT ACTION CLASSES and their D6 defaults: `read`, `index`, `record`,
// `suggest` and `message` are AUTOMATIC; `write`, `commit` and `spawn` wait
// for APPROVAL. The pack's `policy` section (@playform/ets-lib-dsh-pack's
// `Policy` type) carries the same action -> verdict mapping, so a resolved
// pack overrides these defaults per action (the wiring is the next
// refinement; the type already exists).
//
// The name is `Allowlist` rather than `Policy` because the ENTRY exports the
// builder function as `Policy` - TypeScript cannot export a type and a
// function under one name (TS2323, verified), and the builder's name is the
// contract the D6 spec names. The shared State's own `Policy` field stays the
// configured global policy FILE (Interface/State); a consumer maps this block
// to a different State field (the family convention is `Allow`).
export default interface Allowlist {
	/** Read-only inspection of the workspace: automatic. */
	read: "auto" | "approve";
	/** Building or refreshing the index: automatic. */
	index: "auto" | "approve";
	/** Recording a decision, an outcome or a journal entry: automatic. */
	record: "auto" | "approve";
	/** Emitting a suggestion or a note: automatic. */
	suggest: "auto" | "approve";
	/** Writing a file: waits for approval (unless the pack says otherwise). */
	write: "auto" | "approve";
	/** Committing a batch of writes: waits for approval. */
	commit: "auto" | "approve";
	/** Spawning an agent or starting a job: waits for approval. */
	spawn: "auto" | "approve";
	/** Sending a message to another agent: automatic inside the session. */
	message: "auto" | "approve";
}
