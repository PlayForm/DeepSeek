// Command - the GENERIC `normalize-overpass` human-command handler shared by
// the six stream flavors, as a dependency-free factory leaf: the module's
// Function/Command is a thin delegate that re-exports this handler and its
// service types, while the module keeps its identity through `State.Module`
// (every composed line is prefixed with it - the base never hardcodes a
// module name) and its settings/editor seams through Function/Apply.
//
// Grammar (the rawInput begins after the parsed command name):
//
//   files <path...>   -> DECLINED here: the file sweep is owned by the
//                      normalize-file hook (its own Function/Command), so the
//                      stream flavors return the exact decline line;
//   batch           -> arm the one-shot step-batch overpass (the flavor's
//                      Function/StepBatch consumes it on the next batch);
//   results on|off  -> flip `scopes.toolResults` through the settings
//                      service when present, else the config editor, else
//                      report the settings-UI path - the command NEVER
//                      mutates State directly (config stays the single
//                      source of truth, R1 §4b);
//   scopes          -> report the current effective values (read-only).
//
// The handler returns a CommandResult (`success`/`error` with text). Pure per
// call: the only State mutation is the one-shot `Overpass` flag.
//
// The State is STRUCTURAL: only the cells this handler reads are named
// (Module, Scopes, Exempt, Overpass), so each flavor's own State interface
// satisfies it without the base importing the factory's types.
/** The schema-default scopes (the fallback for a hand-built config). */
const DefaultScopes = {
	conversation: true,
	reasoning: true,
	toolInput: false,
	toolResults: false,
	files: true,
	batch: false,
};

/** The schema-default exemption list (the fallback for a hand-built config). */
const DefaultExempt = [
	"read",
	"edit",
	"raw-write",
	"normalize-file",
	"ccr_retrieve",
	"subagent",
	"ask_user_question",
];

/** The structural scope gates the handler reports (all optional). */
type Scopes = {
	conversation?: boolean | undefined;
	reasoning?: boolean | undefined;
	toolInput?: boolean | undefined;
	toolResults?: boolean | undefined;
	files?: boolean | undefined;
	batch?: boolean | undefined;
};

/** The per-apply state cells the handler reads. */
type State = {
	Module: string;
	Scopes?: Scopes | undefined;
	Exempt?: string[] | undefined;
	Overpass?: boolean | undefined;
};

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
export type CommandResult = { kind: "success"; text?: string } | { kind: "error"; text: string };

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
		// once, regardless of the `scopes.batch` value.
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
				if (
					typeof Settings?.describe === "function" &&
					typeof Settings?.update === "function"
				) {
					const Forms = (await Settings.describe()) as {
						ns?: unknown;
						value?: { scopes?: Record<string, unknown> };
					}[];
					const Mine = Array.isArray(Forms)
						? Forms.find(
								(Form) =>
									typeof Form?.ns === "string" && Form.ns.includes(State.Module),
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
								const ID = `${Entry?.id ?? ""} ${Entry?.name ?? ""}`;
								return ID.includes(State.Module);
							})
						: undefined;
					if (Mine) {
						await Editor.edit(Mine, (Current) => ({
							...(Current as object),
							scopes: {
								...((Current as { scopes?: Record<string, unknown> })?.scopes ??
									{}),
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
		// The files sweep: ONLY the normalize-file hook implements it - the
		// stream flavors decline this scope with the module's exact line.
		case "files": {
			return {
				kind: "error",
				text: `${State.Module}: the files sweep is owned by the normalize-file hook - run "normalize-overpass files <path...>" there`,
			};
		}
		default:
			return { kind: "error", text: Usage(State.Module) };
	}
};
