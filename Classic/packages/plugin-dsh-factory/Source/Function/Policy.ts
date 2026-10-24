// Policy - the SHARED policy-block builder (D6), the second module-level
// helper beside `Schema`: `Policy()` returns the Schemastery block a consumer
// spreads into its own schema -
//
//   Compose(false, { ..., policy: Policy() })
//
// The block carries ONE key per action class (read, index, record, suggest,
// write, commit, spawn, message), each an enum of "auto" | "approve" whose
// default is the D6 posture from Variable/Policy (read/index/record/suggest/
// message = auto; write/commit/spawn = approve). It is VOLATILE as one
// object: a policy flip commits hot, and the factory's State builder
// re-reads the whole block into the consumer's mapped State field (the
// family convention is `Allow`; the shared State's `Policy` is the global
// policy FILE).
//
// EXPORTED as the module-level named `Policy` on the entry (Library.ts),
// exactly like `Schema`: the loader needs the composed `Config` at
// MODULE-EVALUATION time, before any context (and therefore any service
// instance) exists. It is NOT a service method - the class surface stays at
// the documented nineteen.
//
// The verdict LOOKUP is Function/Decide (`Decide(policy, action)`); this
// module only builds the schema. The pack's `policy` section overrides these
// defaults per action when a pack is resolved (the wiring is the next
// refinement; the type already exists in @playform/lib-dsh-pack).
import Schema from "@deepseek-ai/schemastery";
import Default from "@Variable/Policy.js";

export default () =>
	Schema.object({
		// Read-only inspection of the workspace: automatic.
		read: Schema.union(["auto", "approve"]).default(Default.read),
		// Building or refreshing the index: automatic.
		index: Schema.union(["auto", "approve"]).default(Default.index),
		// Recording a decision, an outcome or a journal entry: automatic.
		record: Schema.union(["auto", "approve"]).default(Default.record),
		// Emitting a suggestion or a note: automatic.
		suggest: Schema.union(["auto", "approve"]).default(Default.suggest),
		// Writing a file: waits for approval by default.
		write: Schema.union(["auto", "approve"]).default(Default.write),
		// Committing a batch of writes: waits for approval by default.
		commit: Schema.union(["auto", "approve"]).default(Default.commit),
		// Spawning an agent or starting a job: waits for approval by default.
		spawn: Schema.union(["auto", "approve"]).default(Default.spawn),
		// Messaging another agent: automatic inside the session by default.
		message: Schema.union(["auto", "approve"]).default(Default.message),
	}).volatile();
