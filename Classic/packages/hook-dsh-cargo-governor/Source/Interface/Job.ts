// Job — the handle the probed jobs runtime passes to a started job's `run`
// callback (Function/Dispatch). The DSH jobs service is not part of the
// published @deepseek-ai/cordis typings, so the root-level shape the plugin
// consumes is mirrored here structurally: `append` is the job's live log, and
// the cargo CLI output streams into it IN ADDITION to the ledger digest lines
// (Function/Update/Upgrade — the ledger keeps its stable, asserted record;
// the job view additionally shows the run's raw output).
export default interface Job {
	/** Append one output chunk to the job's live log. */
	append(chunk: string): void;
}
