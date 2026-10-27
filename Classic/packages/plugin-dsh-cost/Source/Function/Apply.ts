// Apply - the plugin entry function: the State build (the factory's cell
// unwrap + the P10 volatile refresh), the ledger database opened through the
// fiber's effect lifecycle (the effect opens it, registers the two session
// listeners while the ledger is open and closes it on dispose), the project
// resolution from the session cwd, the durable activation proof, and THE
// HUMAN SURFACE (Documentation/Plans/COST-TRACK-PLUGIN.md section 5): the
// four /cost verbs - report, export, annotate, assess - plus the backfill job
// when the capture gate asks for it (section 6). The function returns NOTHING
// (the loader treats apply returns specially - a returned value silently
// kills event delivery).
//
// The session-log seam (section 1) is exactly two listeners. `session/event`
// (emit, post-commit) is the synchronous recorder: it pushes the event into
// the capture queue and never awaits, never touches I/O and never throws - a
// throw here would fail the tool call that produced the event.
// `session/flush` (parallel) is the durability checkpoint: it takes the
// session's queue and folds it into the ledger. Both listeners are disposed
// with the ledger effect. The plugin stays silent - no tool, no prompt
// section, no model-visible message; the commands render their text OUTSIDE
// model history.
//
// THE HUMAN SURFACE: the registry's name law allows no spaces in a command
// name, so ONE command owns the grammar and the verb is its first word -
// "report [scope] [range]", "export <csv|json|markdown> [path]",
// "annotate [path]", "assess [session]" - the four /cost invocations. The
// registration is fail-open (the normalize-file precedent): a missing or
// already-registered commands service skips the surface and the mount
// continues with the silent listeners. The backfill is a JOB (section 6,
// started through the probed jobs service - the walk itself never runs on the
// boot path), and the jobs stack being absent is a ledger line, not a crash.
import { basename } from "node:path";

import type { Context } from "@deepseek-ai/cordis";
import type { CommandResult } from "@playform/lib-dsh-core";
import type Factory from "@playform/plugin-dsh-factory";

import type Config from "../Interface/Config.js";
import Annotate from "./Annotate.js";
import Assess from "./Assess.js";
import Backfill from "./Backfill.js";
import Capture from "./Capture.js";
import Drain from "./Drain.js";
import Export from "./Export.js";
import Open from "./Open.js";
import Report from "./Report.js";

// The factory vocabulary, the command registry and the session-log seam,
// published on this module's augmentation (the hook-dsh-ccr and the factory's
// State precedent): the factory type arrives TYPE-ONLY from the factory
// package (erased at build), the command registry is the minimal structural
// surface the three verbs need, and the two host events are typed the way the
// host dispatches them - the session itself as the subject.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: Factory;
		/** The human command registry (@deepseek-ai/dsh-commands). */
		commands: Commands;
	}

	interface Events {
		/** One committed session log event; the subject is the session. */
		"session/event"(Subject: unknown, Event: unknown): void;
		/** The session's durability checkpoint; the subject is the session. */
		"session/flush"(Subject: unknown): void;
	}
}

/** The structural command-registry surface the plugin registers through. */
interface Commands {
	register(Definition: {
		name: string;
		description: string;
		handler: (Invocation: {
			rawInput?: unknown;
			signal?: unknown;
		}) => Promise<CommandResult> | CommandResult;
	}): unknown;
}

// One money column of a rendered report row: four decimals, the reading
// precision of a command result (the rows themselves carry six).
const Money = (Value: number): string => Value.toFixed(4);

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via the factory package's own
	// augmentation of the cordis Context).
	const Factory = Context.pluginFactory;

	// The State: the factory's shared shape plus the ledger path, copied from
	// the (cell-unwrapped) validated config by the setup map.
	const State = Factory.State<{ Path: string }>(Context, Options, {
		module: "plugin-dsh-cost",
		fields: { Path: "databasePath" },
	});

	// The ledger: the effect opens the SQLite file (fail loud on an
	// unopenable path), registers the two session listeners while the ledger
	// is open, and closes it on dispose, so a reloaded plugin never leaves a
	// WAL behind a dead fiber nor a queue feeding a closed database.
	let Ledger: ReturnType<typeof Open> | undefined;
	let OffEvent: (() => boolean) | undefined;
	let OffFlush: (() => boolean) | undefined;
	Context.effect(() => {
		Ledger = Open(Options);
		if (Ledger !== undefined) {
			const Queue = Capture(Options);
			const Fold = Drain(Context, Ledger.Database, Options);
			OffEvent = Context.on("session/event", (Subject, Event): void => {
				Queue.Push(Subject, Event);
			});
			OffFlush = Context.on("session/flush", (Subject): void => {
				try {
					const SessionId = (Subject as { id?: unknown } | undefined)?.id;
					if (typeof SessionId !== "string") {
						return;
					}
					const Events = Queue.Take(SessionId);
					if (Events.length === 0) {
						return;
					}
					Fold(Subject, Events);
				} catch {
					/* the flush never throws into the parallel dispatch */
				}
			});
		}
		return () => {
			try {
				OffEvent?.();
				OffFlush?.();
			} catch {
				/* already disposed with the fiber */
			}
			Ledger?.Close();
		};
	}, "plugin-dsh-cost.ledger()");

	// The project: resolved from the session cwd and created on first sight,
	// billed to the configured client (section 3 - the dimension exists so one
	// ledger serves many projects and many clients).
	if (Ledger !== undefined) {
		const Root = process.cwd();
		Ledger.Database.prepare("INSERT OR IGNORE INTO Client (Name) VALUES (?)").run(
			Options.client,
		);
		const Client = Ledger.Database.prepare("SELECT ClientId FROM Client WHERE Name = ?").get(
			Options.client,
		) as { ClientId: number };
		Ledger.Database.prepare(
			"INSERT OR IGNORE INTO Project (ClientId, Name, Root) VALUES (?, ?, ?)",
		).run(Client.ClientId, basename(Root), Root);
	}

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone (the module prefix is the factory's Append layer).
	if (Ledger !== undefined) {
		Factory.Append(State, `activated - ${process.cwd()}`);
	}

	// THE HUMAN SURFACE (section 5): the three /cost verbs. The handlers close
	// over the opened ledger; a command that arrives while the ledger is
	// closed reports the ledger, never a crash.
	if (Ledger !== undefined) {
		const Store = Ledger;
		const Views = Report(Store.Database);
		const Assessor = Assess(Store.Database);
		const Exporter = Export(Store.Database, Options);
		const AnnotateFile = Annotate(Context, Store.Database, Options);
		const Usage =
			"plugin-dsh-cost: usage - report [scope] [range] | export <csv|json|markdown> [path] | " +
			"annotate [path] | assess [session]";

		// One report rendering: the title, up to twenty rows in the reading
		// shape, and the remainder counted.
		type Reported = ReturnType<typeof Views.File>[number];
		const Render = (Title: string, Rows: readonly Reported[]): CommandResult => {
			const Shown = Rows.slice(0, 20);
			const Lines = [
				`${Title} - ${Rows.length} row(s)`,
				...Shown.map(
					(One) =>
						`${One.Key}  direct ${Money(One.Direct)}  amortized ${Money(One.Amortized)}  ` +
						`total ${Money(One.Total)}  calls ${One.Calls}  tokens ${One.Tokens}`,
				),
			];
			if (Rows.length > Shown.length) {
				Lines.push(`... ${Rows.length - Shown.length} more row(s)`);
			}
			return { kind: "success", text: Lines.join("\n") };
		};

		// The report verb: the scope is one of the ledger's five; the optional
		// range is one UTC day, answered from the day aggregate (the Rollup),
		// and an absent range answers from the all-time views.
		const ReportVerb = (Rest: string[]): CommandResult => {
			const Scope = Rest[0] ?? "project";
			const Range = Rest[1];
			switch (true) {
				case Scope !== "file" &&
					Scope !== "project" &&
					Scope !== "client" &&
					Scope !== "model" &&
					Scope !== "session":
					return {
						kind: "error",
						text: `plugin-dsh-cost: unknown report scope "${Scope}" - file, project, client, model, session`,
					};
				default:
			}
			switch (true) {
				case Range === undefined:
					switch (Scope) {
						case "file":
							return Render("cost report file", Views.File());
						case "client":
							return Render("cost report client", Views.Client());
						case "model":
							return Render("cost report model", Views.Model());
						case "session":
							return Render("cost report session", Views.Session());
						default:
							return Render("cost report project", Views.Project());
					}
				default:
					if (!/^\d{4}-\d{2}-\d{2}$/.test(Range)) {
						return {
							kind: "error",
							text: `plugin-dsh-cost: the report range is one UTC day (YYYY-MM-DD), not "${Range}"`,
						};
					}
					return Render(
						`cost report ${Scope} ${Range}`,
						(
							Store.Database.prepare(
								"SELECT Key, SUM(DirectCost) AS Direct, SUM(AmortizedCost) AS Amortized, SUM(Cost) AS Total, " +
									"SUM(Calls) AS Calls, SUM(Tokens) AS Tokens FROM Rollup " +
									"WHERE Scope = ? AND Day = ? GROUP BY Key ORDER BY Total DESC",
							).all(Scope, Range) as Record<string, unknown>[]
						).map((One) => ({
							Scope,
							Key: typeof One["Key"] === "string" ? One["Key"] : "",
							Direct: typeof One["Direct"] === "number" ? One["Direct"] : 0,
							Amortized: typeof One["Amortized"] === "number" ? One["Amortized"] : 0,
							Total: typeof One["Total"] === "number" ? One["Total"] : 0,
							Calls: typeof One["Calls"] === "number" ? One["Calls"] : 0,
							Tokens: typeof One["Tokens"] === "number" ? One["Tokens"] : 0,
						})),
					);
			}
		};

		// The export verb: the format defaults to the configured one; the
		// optional path is the destination (a directory, or an exact file when
		// its extension matches).
		const ExportVerb = async (Rest: string[]): Promise<CommandResult> => {
			const Format = Rest[0] ?? Options.export.format;
			switch (true) {
				case Format !== "csv" && Format !== "json" && Format !== "markdown":
					return {
						kind: "error",
						text: `plugin-dsh-cost: unknown export format "${Format}" - csv, json, markdown`,
					};
				default:
			}
			try {
				const Result = Exporter(Format, Rest[1]);
				return {
					kind: "success",
					text: `plugin-dsh-cost: exported ${Result.Rows} row(s) to ${Result.Path}`,
				};
			} catch (Issue) {
				return {
					kind: "error",
					text: `plugin-dsh-cost: export failed - ${Issue instanceof Error ? Issue.message : String(Issue)}`,
				};
			}
		};

		// The annotate verb: the named paths, or every file the ledger knows
		// for the current project when no path is given.
		const Known = (): string[] =>
			(
				Store.Database.prepare(
					"SELECT File.Path AS Path FROM File JOIN Project ON Project.ProjectId = File.ProjectId " +
						"WHERE Project.Root = ? ORDER BY File.Path",
				).all(process.cwd()) as { Path: unknown }[]
			)
				.map((One) => One.Path)
				.filter((One): One is string => typeof One === "string");
		const AnnotateVerb = async (Rest: string[]): Promise<CommandResult> => {
			try {
				const Paths = Rest.length > 0 ? Rest : Known();
				const Lines: string[] = [];
				for (const Path of Paths) {
					const One = await AnnotateFile(Path);
					Lines.push(`${Path}: ${One.Written ? "written" : "skipped"} (${One.Reason})`);
				}
				return {
					kind: "success",
					text:
						Lines.length === 0
							? "plugin-dsh-cost: annotate - no files known for this project"
							: Lines.join("\n"),
				};
			} catch (Issue) {
				return {
					kind: "error",
					text: `plugin-dsh-cost: annotate failed - ${Issue instanceof Error ? Issue.message : String(Issue)}`,
				};
			}
		};

		// The assess verb (section 12): one session's spend bucketed the way a
		// client argues about it - delivered, explored, reverted, overhead,
		// carry - plus the derived cost per surviving line. The named session
		// when given, every session when not.
		const AssessVerb = (Rest: string[]): CommandResult => {
			const Session = Rest[0];
			const Rows = Assessor(Session === undefined || Session.length === 0 ? undefined : Session);
			const Shown = Rows.slice(0, 20);
			const Lines = [
				`cost assess${Session === undefined || Session.length === 0 ? "" : ` ${Session}`} - ${Rows.length} session(s)`,
				...Shown.map(
					(One) =>
						`${One.SessionId}  delivered ${Money(One.Delivered)}  explored ${Money(One.Explored)}  ` +
						`reverted ${Money(One.Reverted)}  overhead ${Money(One.Overhead)}  carry ${Money(One.Carry)}  ` +
						`per-line ${Money(One.CostPerLine)}`,
				),
			];
			if (Rows.length > Shown.length) {
				Lines.push(`... ${Rows.length - Shown.length} more session(s)`);
			}
			return { kind: "success", text: Lines.join("\n") };
		};

		const Commands = Context.commands;
		if (typeof Commands?.register === "function") {
			try {
				Commands.register({
					name: "cost",
					description:
						"Cost report | export | annotate | assess: 'report [scope] [range]' | " +
						"'export <csv|json|markdown> [path]' | 'annotate [path]' | 'assess [session]'",
					handler: async (Invocation): Promise<CommandResult> => {
						const Raw =
							typeof Invocation?.rawInput === "string"
								? Invocation.rawInput.trim()
								: "";
						const Words = Raw.length === 0 ? [] : Raw.split(/\s+/);
						const Verb = Words[0] ?? "";
						const Rest = Words.slice(1);
						switch (true) {
							case Verb === "report":
								return ReportVerb(Rest);
							case Verb === "export":
								return await ExportVerb(Rest);
							case Verb === "annotate":
								return await AnnotateVerb(Rest);
							case Verb === "assess":
								return AssessVerb(Rest);
							default:
								return { kind: "error", text: Usage };
						}
					},
				});
			} catch (Issue) {
				Factory.Append(
					State,
					`command "cost" registration skipped (the mount continues): ${
						Issue instanceof Error ? Issue.message : String(Issue)
					}`,
				);
			}
		}

		// The backfill (section 6): a JOB, started when the capture gate asks
		// for it - the walk itself runs inside the job fiber, never on the
		// boot path. The jobs service is probed (the plugin does not inject
		// it); an absent jobs stack is a ledger line, not a crash.
		if (Options.capture.backfill) {
			const Walk = Backfill(Context, Store.Database, Options);
			const Jobs = Context.get("jobs") as
				{ start?: (Specification: unknown) => unknown } | undefined;
			if (typeof Jobs?.start === "function") {
				Jobs.start({
					kind: "cost-backfill",
					label: "plugin-dsh-cost: session backfill",
					run: () => ({
						done: Walk().then(
							(Result) => ({
								status: "completed" as const,
								detail: `${Result.Sessions} session(s), ${Result.Calls} call(s)`,
							}),
							(Issue) => ({
								status: "failed" as const,
								detail: Issue instanceof Error ? Issue.message : String(Issue),
							}),
						),
						cancel: () => undefined,
					}),
				});
			} else {
				Factory.Append(
					State,
					"backfill requested but the jobs service is absent - skipped",
				);
			}
		}
	}
};
