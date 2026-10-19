// Command - the `normalize-overpass` HUMAN COMMAND handler (the plan's §5),
// registered in Function/Apply through the `commands` service (the Human
// command registry, capability-seams.md:675) with the probe-once Seam
// accessor (Function/Seam - never the dead accessor). Grammar (the rawInput
// begins after the parsed command name):
//
//   files <path…>   -> run the file sweep: the normalize-file pipeline
//                      (Function/Normalize) per path, each changed file
//                      written through the ONE shared write executor with
//                      its own count line, then the summary ledger line
//                      `overpass: swept K file(s), normalized M char(s)`
//                      (only the normalize-file hook implements it).
//   batch           -> arm the one-shot step-batch overpass (Function/
//                      StepBatch consumes it on the next incoming batch);
//   results on|off  -> flip `scopes.toolResults` through the settings
//                      service when present, else the config editor, else
//                      report the settings-UI path - the command NEVER
//                      mutates State directly (config stays the single
//                      source of truth, R1 §4b);
//   scopes          -> report the current effective values (read-only).
//
// The handler returns a CommandResult (`success`/`error` with text) - the
// dispatching UI renders it directly. Pure per call: the only State mutation
// is the one-shot `Overpass` flag, which is the designed arm mechanism.
import Normalize from "./Normalize.js";
import type State from "@Interface/State.js";
import { DefaultExempt, DefaultScopes } from "./Overpass.js";

/** The structural CommandInvocation: only the fields the handler reads. */
type Invocation = { rawInput?: unknown; signal?: unknown };

/** The structural `commands` service surface the Apply registration uses. */
export type CommandsService = {
	register: (Definition: {
		name: string;
		description: string;
		handler: (Invocation: Invocation) => Promise<CommandResult> | CommandResult;
	}) => unknown;
};

/** The structural CommandResult (success/error with text). */
export type CommandResult =
	| { kind: "success"; text?: string }
	| { kind: "error"; text: string };

/** Structural views of the optional config-writing services. */
export type SettingsService = {
	describe?: () => unknown;
	update?: (ns: string, patch: object) => Promise<void> | void;
};
export type ConfigEditorService = {
	entries?: () => unknown;
	edit?: (Entry: unknown, Change: (Current: object) => object) => Promise<void> | void;
};

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
	switch (Head) {
		// The read-only effective-values report (observability lives here -
		// the activation line never changes for volatile edits).
		case "scopes": {
			const Scopes = State.Scopes ?? DefaultScopes;
			const Exempt = State.Exempt ?? DefaultExempt;
			return {
				kind: "success",
				text:
					`${State.Module} scopes: conversation=${Scopes.conversation ? "on" : "off"}` +
					`, reasoning=${Scopes.reasoning ? "on" : "off"}` +
					`, toolInput=${Scopes.toolInput ? "on" : "off"}` +
					`, toolResults=${Scopes.toolResults ? "on" : "off"}` +
					`, files=${Scopes.files ? "on" : "off"}` +
					`, batch=${Scopes.batch ? "on" : "off"}` +
					`; exempt: ${Exempt.join(", ")}`,
			};
		}
		// The one-shot step-batch arm: the next incoming batch is normalized
		// once, regardless of the `scopes.batch` value (Function/StepBatch
		// consumes and clears the flag).
		case "batch": {
			State.Overpass = true;
			return {
				kind: "success",
				text: `${State.Module}: one-shot batch overpass armed - the next step batch will be normalized once`,
			};
		}
		// The tool-results scope flip - through the config services, never
		// through direct State mutation (config is the single source of
		// truth; the P10 refresh listener propagates the new value live).
		case "results": {
			const On = Rest[0] === "on" ? true : Rest[0] === "off" ? false : undefined;
			if (On === undefined) {
				return { kind: "error", text: Usage(State.Module) };
			}
			// First path: the settings service (the Web UI's own seam).
			try {
				if (typeof Settings?.describe === "function" && typeof Settings?.update === "function") {
					const Forms = (await Settings.describe()) as {
						ns?: unknown;
						value?: { scopes?: Record<string, unknown> };
					}[];
					const Mine = Array.isArray(Forms)
						? Forms.find(
								(Form) => typeof Form?.ns === "string" && Form.ns.includes(State.Module),
							)
						: undefined;
					if (Mine && typeof Mine.ns === "string") {
						await Settings.update(Mine.ns, {
							scopes: { ...(Mine.value?.scopes ?? {}), toolResults: On },
						});
						return {
							kind: "success",
							text: `${State.Module}: scopes.toolResults ${On ? "on" : "off"} (settings service)`,
						};
					}
				}
			} catch {
				/* fall through to the config editor */
			}
			// Second path: the config editor (persists a profile patch).
			try {
				if (typeof Editor?.entries === "function" && typeof Editor?.edit === "function") {
					const Entries = Editor.entries() as { id?: unknown; name?: unknown }[];
					const Mine = Array.isArray(Entries)
						? Entries.find((Entry) => {
								const Id = `${Entry?.id ?? ""} ${Entry?.name ?? ""}`;
								return Id.includes(State.Module);
							})
						: undefined;
					if (Mine) {
						await Editor.edit(Mine, (Current) => ({
							...(Current as object),
							scopes: {
								...((Current as { scopes?: Record<string, unknown> })?.scopes ?? {}),
								toolResults: On,
							},
						}));
						return {
							kind: "success",
							text: `${State.Module}: scopes.toolResults ${On ? "on" : "off"} (config editor)`,
						};
					}
				}
			} catch {
				/* fall through to the report */
			}
			// Fallback: report the settings-UI path (the command never mutates
			// State directly).
			return {
				kind: "success",
				text: `${State.Module}: no settings/config-editor service available - flip "scopes.toolResults" to ${String(On)} in the settings UI (Plugins -> ${State.Module}); the change applies live without remount`,
			};
		}
		// The files sweep (ONLY the normalize-file hook implements it): the
		// normalize-file pipeline per path - read, six-fold count, write only
		// when N > 0 through the ONE shared write executor (each changed file
		// writes its own count line + journal record) - then the summary
		// ledger line. A failing path fails the command with the context
		// prefix, like the tool does.
		case "files": {
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
		default:
			return { kind: "error", text: Usage(State.Module) };
	}
};
