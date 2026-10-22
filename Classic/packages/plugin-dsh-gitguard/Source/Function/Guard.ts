// Guard - the tools/pre-execute listener (Function/Guard): the intercept
// (ORCHESTRATION-PLUGINS.md section 3). Registered as a WATERFALL on the
// plugin's own context (the guard judges only the dispatches the terminal
// surface delivers; root registration is NOT used - a pre-execute
// transform is scoped, unlike the observation listeners).
//
// THE DISCIPLINE:
//   * fail-open: ANY error in the guard body means the dispatch passes
//     UNCHANGED (the guard must never break a legitimate tool call - the
//     whole judged path is one try/catch, and the catch calls next());
//   * the deny arm is the ONE listener that deliberately omits next():
//     the refusal REPLACES the dispatch (the command must never execute -
//     the plan's "the agent's correct path is simply the only executable
//     one");
//   * denials surface ONCE (the refusal is the returned decision) and are
//     ledgered for the user's audit - NEVER punished (no second refusal,
//     no escalation);
//   * a command the guard cannot read (no command string found in the
//     dispatch) passes unchanged - the guard never guesses.
//
// THE EXCLUDE: a dispatch whose working directory matches the configured
// exclusion list (the factory's segment match) skips the guard entirely -
// the paths the user declared out of the guard's jurisdiction.
import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import Decide from "@Function/Decide.js";
import type Decision from "@Interface/Decision.js";
import type State from "@Interface/State.js";

/** The refusal line (module-owned, byte-stable): surfaces ONCE, never
 *  punishes - it states the rule and the allowed path, nothing more. */
const Refusal = (Sub: string, Reason: string): string =>
	`gitguard: refused "git ${Sub}" (${Reason}) - git is read-only in this session (the checks-only law). Allowed: git status, log, diff, show, rev-parse, ls-files, fetch.`;

/** The command string extraction: the dispatch shapes are probed
 *  defensively (a string payload, or an object carrying the command under
 *  `command` / `exec.command` / `input.command` / `cmd`). No match =
 *  undefined - the guard passes, it never guesses. */
const Command = (Payload: unknown): string | undefined => {
	switch (true) {
		case typeof Payload === "string":
			return Payload;
	}
	const Object = Payload as
		| {
				command?: unknown;
				cmd?: unknown;
				exec?: { command?: unknown };
				input?: { command?: unknown };
		  }
		| null
		| undefined;
	if (Object === null || Object === undefined) {
		return undefined;
	}
	switch (true) {
		case typeof Object.command === "string":
			return Object.command;
		case typeof Object.cmd === "string":
			return Object.cmd;
		case typeof Object.exec?.command === "string":
			return Object.exec.command;
		case typeof Object.input?.command === "string":
			return Object.input.command;
		default:
			return undefined;
	}
};

/** The dispatch's working directory, for the exclusion match (best-effort:
 *  `cwd` / `exec.cwd` / `workingDirectory`). */
const Directory = (Payload: unknown): string | undefined => {
	const Object = Payload as
		{ cwd?: unknown; exec?: { cwd?: unknown }; workingDirectory?: unknown } | null | undefined;
	if (Object === null || Object === undefined) {
		return undefined;
	}
	switch (true) {
		case typeof Object.cwd === "string":
			return Object.cwd;
		case typeof Object.exec?.cwd === "string":
			return Object.exec.cwd;
		case typeof Object.workingDirectory === "string":
			return Object.workingDirectory;
		default:
			return undefined;
	}
};

export default async (
	State: State,
	Payload: ToolExecution,
	Next: () => Promise<PreToolDecision>,
): Promise<PreToolDecision> => {
	try {
		const Dir = Directory(Payload);
		switch (true) {
			case Dir !== undefined && State.Factory.Match(Dir, State.List):
				// The excluded path: out of the guard's jurisdiction, silently.
				return await Next();
			default:
		}
		const Command0 = Command(Payload);
		switch (true) {
			case Command0 === undefined:
				// No readable command: pass, never guess.
				return await Next();
		}
		const Verdict: Decision = Decide(State, Command0);
		switch (true) {
			case Verdict.verdict === "allow":
				return await Next();
		}
		// THE REFUSAL: the denial surfaces ONCE and is ledgered - the command
		// never executes (next() is deliberately not called). The refusal
		// payload is returned verbatim (the family's legacy pre-execute
		// refusal shape); the cast is type-level only.
		State.Factory.Append(State, `denied ${Verdict.subcommand || "bare"} (${Verdict.reason})`);
		return {
			decision: "deny",
			refusal: Refusal(Verdict.subcommand || "", Verdict.reason),
		} as unknown as PreToolDecision;
	} catch {
		// Fail-open: a broken guard must never break a legitimate call.
		return await Next();
	}
};
