// Apply - the plugin entry function: the ledger opened READ-ONLY through the
// fiber's effect lifecycle (the effect opens it and closes it on dispose),
// and THE HUMAN SURFACE (Documentation/Plans/COST-TRACK-PLUGIN.md section
// 13): ONE command, `/cost analysis [scope]`, registered through the
// commands service. The registry's name law allows no spaces in a command
// name, so the plugin registers under the family's "cost" name with the
// "analysis" verb as its first word; the registration is fail-open (the
// normalize-file precedent): a missing or already-registered commands
// service skips the surface and the mount continues. The plugin registers
// NO tool, adds NO prompt section, and sends NO model-visible message - it
// also registers no session listener at all: a conversation runs identically
// whether this plugin is loaded or not, and the command renders its text
// OUTSIDE model history.
//
// A ledger file that does not exist is a setup state and not a crash: the
// open failure is recorded, the plugin still loads, and the command says so
// when it is invoked.
import type { Context } from "@deepseek-ai/cordis";
import type { CommandResult } from "@playform/lib-dsh-core";
import type Factory from "@playform/plugin-dsh-factory";

import type Config from "../Interface/Config.js";
import type Metric from "../Interface/Metric.js";
import Analysis from "./Analysis.js";
import Open from "./Open.js";

// The factory vocabulary and the command registry, published on this
// module's augmentation (the cost tracker's precedent): the factory type
// arrives TYPE-ONLY from the factory package (erased at build), the command
// registry is the minimal structural surface the one command needs.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: Factory;
		/** The human command registry (@deepseek-ai/dsh-commands). */
		commands: Commands;
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

// One metric row rendered as short text: key, name, the value with its unit
// (whole numbers bare, everything else at four decimals), and the note.
const Short = (One: Metric): string =>
	`${One.Key}  ${One.Metric}  ${
		Number.isInteger(One.Value) ? String(One.Value) : One.Value.toFixed(4)
	} ${One.Unit}  ${One.Note}`;

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via the factory package's own
	// augmentation of the cordis Context).
	const Factory = Context.pluginFactory;

	// The State: the factory's shared shape plus the ledger path, copied
	// from the (cell-unwrapped) validated config by the setup map.
	const State = Factory.State<{ Path: string }>(Context, Options, {
		module: "plugin-dsh-cost-analysis",
		fields: { Path: "databasePath" },
	});

	// The ledger: the effect opens the SQLite file READ-ONLY (an open
	// failure is recorded, never thrown, so the mount continues without the
	// ledger) and closes it on dispose, so a reloaded plugin never leaves a
	// reader behind a dead fiber.
	let Ledger: ReturnType<typeof Open> | undefined;
	let Failure: string | undefined;
	Context.effect(() => {
		try {
			Ledger = Open(Options);
		} catch (Issue) {
			Failure = Issue instanceof Error ? Issue.message : String(Issue);
			return () => undefined;
		}
		return () => {
			Ledger?.Close();
		};
	}, "plugin-dsh-cost-analysis.ledger()");

	// Durable activation proof - "did it activate" must be answerable from
	// the factory's ledger alone (the module prefix is the Append layer).
	if (Ledger !== undefined) {
		Factory.Append(State, `activated read-only over ${Options.databasePath}`);
	} else if (Failure !== undefined) {
		Factory.Append(State, `ledger not opened - ${Failure}`);
	}

	// The analysis over the opened ledger; absent when the ledger is not
	// open, and the command then says so.
	const Views = Ledger === undefined ? undefined : Analysis(Ledger.Database, Options);

	// THE HUMAN SURFACE: one command. The verb grammar is "analysis
	// [scope]"; the scope is one of the ledger's five and defaults to
	// "file"; any other verb answers the usage line. The handler renders
	// the metric rows of the enabled families and reports "the ledger is
	// empty" when a scope has no rows.
	const Usage = "plugin-dsh-cost-analysis: usage - analysis [scope]";

	const Commands = Context.commands;
	if (typeof Commands?.register === "function") {
		try {
			Commands.register({
				name: "cost",
				description:
					"Cost analysis (read-only): 'analysis [scope]' - the contribution and efficiency metrics over the ledger the cost plugin wrote",
				handler: (Invocation): CommandResult => {
					const Raw =
						typeof Invocation?.rawInput === "string" ? Invocation.rawInput.trim() : "";
					const Words = Raw.length === 0 ? [] : Raw.split(/\s+/);
					const Verb = Words[0] ?? "";
					const Scope = Words[1] ?? "file";
					if (Verb !== "analysis") {
						return { kind: "error", text: Usage };
					}
					if (Views === undefined) {
						return {
							kind: "error",
							text:
								`plugin-dsh-cost-analysis: the ledger is not open - run the ` +
								`@playform/plugin-dsh-cost plugin first ` +
								`(${Failure ?? "the ledger file does not exist"})`,
						};
					}
					const Readings = [
						...Views.Credit(Scope),
						...Views.Effectiveness(Scope),
						...Views.Lines(Scope),
						...Views.Overhead(Scope),
						...Views.Cache(Scope),
					];
					if (Readings.length === 0) {
						return {
							kind: "success",
							text: `cost analysis ${Scope}: the ledger is empty`,
						};
					}
					const Lines: string[] = [
						`cost analysis ${Scope} - ${Readings.length} reading(s)`,
					];
					for (const One of Readings) {
						Lines.push(`${One.Scope}  ${One.Key}`);
						for (const Row of One.Rows) {
							Lines.push(`  ${Short(Row)}`);
						}
					}
					return { kind: "success", text: Lines.join("\n") };
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
};
