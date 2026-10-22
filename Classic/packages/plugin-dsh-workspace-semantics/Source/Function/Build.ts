// Build - the lazy model builder (Function/Build), the service's resolve().
// A FRESH index hit (the model's version matches the path's latest observed
// version) returns without any I/O. Otherwise the file's text is read through
// the injected `fs` facility, the extension's adapter is looked up, and the
// adapter's scan produces the model. The refusal-to-guess rule: a path with
// no adapter for its extension resolves to `undefined` and ONE ledger line
// `refused <path> (no adapter for <ext>)` - never a guessed model.
//
// The index cap: when the index exceeds `maxEntries`, the OLDEST entries by
// index revision are dropped (the bounded index, the observe ring's cap
// pattern). The revision is the service's own monotonic counter - never a
// wall clock.
import type Model from "@Interface/Model.js";
import type State from "@Interface/State.js";

/** The extension of a path (with dot, lowercase), or "" for none. */
const Extension = (Path: string): string => {
	const Dot = Path.lastIndexOf(".");
	const Slash = Math.max(Path.lastIndexOf("/"), Path.lastIndexOf("\\"));
	return Dot > Slash ? Path.slice(Dot).toLowerCase() : "";
};

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
	const Adapter = State.Adapters.get(Extension(Path));
	switch (true) {
		case !Adapter:
			State.Factory.Append(
				State,
				`refused ${Path} (no adapter for ${Extension(Path) || "no extension"})`,
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
		const Scan = Adapter.scan(Text, Path);
		State.Revision += 1;
		const Model: Model = {
			path: Path,
			version: "manual",
			indexRevision: State.Revision,
			symbols: Scan.symbols,
			references: Scan.references,
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
