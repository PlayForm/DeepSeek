// Command - the ets-plugin-dsh-normalize-file's `normalize-overpass` handler:
// the FILES SWEEP is the one real implementation (the six stream flavors
// decline that scope), and every non-files branch delegates to the ETS base's
// generic handler (@playform/ets-base-dsh/Overpass/Command) - the grammar, the
// scopes report, the batch arm, the results paths and the usage line are the
// same machinery the other flavors run, so they are not forked here.
//
// The files sweep: the normalize-file pipeline (Function/Normalize) per path,
// each changed file written through the ONE shared write executor with its own
// count line, then the summary ledger line
// `overpass: swept K file(s), normalized M char(s)`. A failing path fails the
// command with the context prefix, like the tool does.
//
// The module keeps its identity through State.Module (the Classic identity,
// `plugin-dsh-normalize-file`), so every user-facing string stays byte-identical.
// The service types are re-exported because Function/Apply imports them from
// this module (the import path stays untouched).
import type State from "@Interface/State.js";
import {
	Command,
	type CommandResult,
	type ConfigEditorService,
	type SettingsService,
} from "@playform/ets-base-dsh";

import Normalize from "./Normalize.js";

export type {
	CommandResult,
	CommandsService,
	ConfigEditorService,
	SettingsService,
} from "@playform/ets-base-dsh";

/** The structural CommandInvocation: only the fields the handler reads. */
type Invocation = { rawInput?: unknown; signal?: unknown };

/** The usage line (shared by every malformed invocation). */
const Usage = (Module: string): string =>
	`${Module} normalize-overpass usage: "files <path...>" | "batch" | "results on|off" | "scopes"`;

export default async (
	State: State,
	Invocation: Invocation,
	Settings: SettingsService | undefined,
	Editor: ConfigEditorService | undefined,
): Promise<CommandResult> => {
	const Raw = typeof Invocation?.rawInput === "string" ? Invocation.rawInput.trim() : "";
	const Words = Raw.length === 0 ? [] : Raw.split(/\s+/);
	const Head = Words[0] ?? "";
	const Rest = Words.slice(1);
	// The files sweep: the ONLY real implementation (the stream flavors
	// decline this scope in the base handler). A missing path is the shared
	// usage error; a failing path fails the command with the context prefix.
	if (Head === "files") {
		if (Rest.length === 0) {
			return { kind: "error", text: Usage(State.Module) };
		}
		const Signal = Invocation?.signal instanceof AbortSignal ? Invocation.signal : undefined;
		// exactOptionalPropertyTypes: only carry the key when a signal exists.
		const Options = Signal === undefined ? {} : { signal: Signal };
		let Swept = 0;
		let Chars = 0;
		for (const Path of Rest) {
			try {
				const Target = await State.Context.fs.resolve(Path, Options);
				const Outcome = await Normalize(State, Target, Options);
				Swept += 1;
				Chars += Outcome.count;
			} catch (Error_) {
				return {
					kind: "error",
					text: `${State.Module}: cannot sweep ${Path}: ${(Error_ as Error).message}`,
				};
			}
		}
		const Line = `overpass: swept ${Swept} file(s), normalized ${Chars} char(s)`;
		State.Factory.Append(State, Line);
		State.Factory.Journal(State, "normalized", "sweep", Line);
		return { kind: "success", text: `${State.Module}: ${Line}` };
	}
	// Every other branch (scopes/batch/results/usage) is the base's generic
	// handler; the module identity rides on State.Module.
	return Command(State, Invocation, Settings, Editor);
};
