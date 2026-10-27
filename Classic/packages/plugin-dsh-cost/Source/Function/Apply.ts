// Apply - the plugin entry function: the State build (the factory's cell
// unwrap + the P10 volatile refresh), the ledger database opened through the
// fiber's effect lifecycle (the effect opens it, registers the two session
// listeners while the ledger is open and closes it on dispose), the project
// resolution from the session cwd, and the durable activation proof. The
// function returns NOTHING (the loader treats apply returns specially - a
// returned value silently kills event delivery).
//
// The session-log seam (Documentation/Plans/COST-TRACK-PLUGIN.md section 1)
// is exactly two listeners. `session/event` (emit, post-commit) is the
// synchronous recorder: it pushes the event into the capture queue and never
// awaits, never touches I/O and never throws - a throw here would fail the
// tool call that produced the event. `session/flush` (parallel) is the
// durability checkpoint: it takes the session's queue and folds it into the
// ledger. Both listeners are disposed with the ledger effect. The plugin
// stays silent - no tool, no prompt section, no model-visible message.
import { basename } from "node:path";

import type { Context } from "@deepseek-ai/cordis";
import type Factory from "@playform/plugin-dsh-factory";

import type Config from "../Interface/Config.js";
import Capture from "./Capture.js";
import Drain from "./Drain.js";
import Open from "./Open.js";

// The factory vocabulary and the session-log seam, published on this module's
// augmentation (the hook-dsh-ccr and the factory's State precedent): the
// factory type arrives TYPE-ONLY from the factory package (erased at build),
// so `ctx.pluginFactory` is fully typed at every consumption site, and the
// two host events are typed the way the host dispatches them - the session
// itself as the subject.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: Factory;
	}

	interface Events {
		/** One committed session log event; the subject is the session. */
		"session/event"(Subject: unknown, Event: unknown): void;
		/** The session's durability checkpoint; the subject is the session. */
		"session/flush"(Subject: unknown): void;
	}
}

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
};
