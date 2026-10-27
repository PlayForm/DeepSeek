// Apply - the plugin entry function: the State build (the factory's cell
// unwrap + the P10 volatile refresh), the ledger database opened through the
// fiber's effect lifecycle (the effect opens it and the same effect closes it
// on dispose), the project resolution from the session cwd, and the durable
// activation proof. The function returns NOTHING (the loader treats apply
// returns specially - a returned value silently kills event delivery).
//
// NO session listener is registered yet: the engine lane adds the capture and
// flush listeners plus the commands (Documentation/Plans/
// COST-TRACK-PLUGIN.md sections 1 and 5). The plugin stays silent - no tool,
// no prompt section, no model-visible message.
import type { Context } from "@deepseek-ai/cordis";
import { basename } from "node:path";
import type Factory from "@playform/plugin-dsh-factory";

import type Config from "../Interface/Config.js";
import Open from "./Open.js";

// The factory vocabulary, published on this module's augmentation (the
// hook-dsh-ccr precedent): the type arrives TYPE-ONLY from the factory
// package (erased at build), so `ctx.pluginFactory` is fully typed at the
// consumption sites below and at every engine-lane listener this lane adds.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: Factory;
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
	// unopenable path) and the same effect's disposer closes it, so a
	// reloaded plugin never leaves a WAL behind a dead fiber.
	let Ledger: ReturnType<typeof Open> | undefined;
	Context.effect(() => {
		Ledger = Open(State.Path);
		return () => {
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
