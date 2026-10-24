// Build - the lazy model builder (Function/Build), the service's resolve().
// A FRESH index hit (the model's version matches the path's latest observed
// version) returns without any I/O. Otherwise the file's text is read through
// the injected `fs` facility, the path's adapter is selected (Function/Select:
// the exact basename first, then the extension), and the adapter's scan
// produces the model. The refusal-to-guess rule: a path with no adapter for
// its extension resolves to `undefined` and ONE ledger line
// `refused <path> (no adapter for <ext>)` - never a guessed model.
//
// THE DEEPENING: when a deepener is registered for the extension
// (Function/Deepen - the harness LSP seam, Function/Lsp), it is asked for the
// scope-resolved reference list AFTER the lexical scan. An answer (an array)
// replaces the lexical references and ledgers
// `deepened <path> (<n> references via <name>)`; `undefined` - the seam is
// absent, has no provider, or failed - keeps the lexical list and adds no
// line. The symbols always come from the adapter (the seam enumerates none).
//
// The index cap: when the index exceeds `maxEntries`, the OLDEST entries by
// index revision are dropped (the bounded index, the observe ring's cap
// pattern). The revision is the service's own monotonic counter - never a
// wall clock.
import Select from "@Function/Select.js";
import type Model from "@Interface/Model.js";
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type State from "@Interface/State.js";

/** The workspace root the deepener's queries resolve against. */
const Root = (State: State): string => (State.Root.length > 0 ? State.Root : process.cwd());

/** Drop index entries until the index fits the cap. */
const Cap = (State: State): void => {
	while (State.Index.size > State.MaxEntries) {
		let Oldest: string | undefined;
		let Revision = Number.POSITIVE_INFINITY;
		for (const [Path, Model] of State.Index) {
			if (Model.indexRevision < Revision) {
				Revision = Model.indexRevision;
				Oldest = Path;
			}
		}
		if (Oldest === undefined) {
			break;
		}
		State.Index.delete(Oldest);
	}
};

export default async (State: State, Path: string): Promise<Model | undefined> => {
	switch (true) {
		case !State.On:
			// The idle-forever posture: a disabled service answers honestly
			// with nothing, never with a guessed model.
			return undefined;
		case typeof Path !== "string" || Path.length === 0:
			State.Factory.Append(State, "failed resolve (empty path)");
			return undefined;
		case State.Factory.Match(Path, State.List):
			State.Factory.Append(State, `ignored ${Path} (excluded)`);
			return undefined;
		default:
	}
	const Selected = Select(State, Path);
	switch (true) {
		case Selected.Adapter === undefined:
			State.Factory.Append(
				State,
				`refused ${Path} (no adapter for ${Selected.Suffix || "no extension"})`,
			);
			return undefined;
		default:
	}
	try {
		const Text = await (
			State.Fs as {
				readText?: (path: string) => Promise<string>;
			} | null
		)?.readText?.(Path);
		if (typeof Text !== "string") {
			State.Factory.Append(State, `failed ${Path} (no fs text reader)`);
			return undefined;
		}
		const Scan = Selected.Adapter.scan(Text, Path);
		let references: ReferenceNode[] = Scan.references;
		const Deepening = State.Deepenings.get(Selected.Suffix);
		switch (true) {
			case Deepening === undefined:
				break;
			default:
				try {
					const Deepened = await Deepening.references(
						State.Context,
						Root(State),
						Path,
						Text,
						Scan.symbols,
					);
					switch (true) {
						case Deepened === undefined:
							// "Cannot answer": the lexical list stands.
							break;
						default:
							references = Deepened;
							State.Factory.Append(
								State,
								`deepened ${Path} (${Deepened.length} references via ${Deepening.name})`,
							);
					}
				} catch {
					// A deepener never breaks the model: the lexical list stands.
				}
		}
		State.Revision += 1;
		const Model: Model = {
			path: Path,
			version: "manual",
			indexRevision: State.Revision,
			symbols: Scan.symbols,
			references,
			dependencies: Scan.dependencies,
			freshness: Scan.certain ? "fresh" : "stale",
		};
		State.Index.set(Path, Model);
		Cap(State);
		try {
			void State.Handle?.table("meta")
				.put("__revision", State.Revision)
				.catch(() => {
					/* persistence best-effort */
				});
		} catch {
			/* persistence best-effort */
		}
		State.Factory.Append(
			State,
			`resolved ${Path} (${Model.symbols.length} symbols, ${Model.references.length} references)`,
		);
		try {
			void State.Handle?.table("models")
				.put(Path, Model)
				.catch(() => {
					/* persistence best-effort */
				});
		} catch {
			/* persistence best-effort */
		}
		return Model;
	} catch (Cause) {
		State.Factory.Append(
			State,
			`failed ${Path} (${Cause instanceof Error ? Cause.message : String(Cause)})`,
		);
		return undefined;
	}
};
