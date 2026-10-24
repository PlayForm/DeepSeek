// Index - the indexFile body: resolve through ctx.fs.resolve (the backend's
// own cwd, the session working directory), stat, gate (enabled, exclude,
// include, file type, language, size), read, parse, ASK THE SEMANTICS SERVICE
// for the file's references (Function/References - the `references` edge's
// consumer wiring; no service means no references edges), cap the node count,
// store the record (mirror + KV, awaiting the pending open first), bump the
// indexRevision, persist the meta record, and ledger the byte-exact
// `indexed <path> version <version> (<nodes> nodes, <edges> edges)` line.
// Every gate skip and failure carries the byte-exact `skipped`/`failed`
// line and the same reason in the outcome.
import type Outcome from "@Interface/Outcome.js";
import type State from "@Interface/State.js";

import Emit from "../Trace/Emit.js";
import Indexed from "../Trace/Indexed.js";
import Invalidated from "../Trace/Invalidated.js";
import Append from "./Append.js";
import Glob from "./Glob.js";
import Language from "./Language.js";
import ParseFile from "./ParseFile.js";
import ReferenceEdges from "./References.js";
import Store from "./Store.js";

export default async (StateRef: State, Path: string): Promise<Outcome> => {
	const Fs = (StateRef.Context as unknown as { fs: any }).fs;
	const Target = await Fs.resolve(Path);
	const Key = Target.displayPath as string;
	const Skip = (Reason: string): Outcome => {
		Append(StateRef, `skipped ${Key} (${Reason})`);
		return { path: Key, status: "skipped", nodes: 0, edges: 0, reason: Reason };
	};
	const Fail = (Reason: string): Outcome => {
		Append(StateRef, `failed ${Key} (${Reason})`);
		return { path: Key, status: "failed", nodes: 0, edges: 0, reason: Reason };
	};
	try {
		if (StateRef.Config.enabled === false) {
			return Skip("disabled");
		}
		for (const Pattern of StateRef.Config.exclude) {
			if (Glob(Pattern, Key)) {
				return Skip("excluded");
			}
		}
		if (
			StateRef.Config.include.length > 0 &&
			!StateRef.Config.include.some((Item) => Glob(Item, Key))
		) {
			return Skip("not included");
		}
		const Info = await Fs.stat(Target);
		if (Info === undefined || Info.type !== "file") {
			return Skip("not a file");
		}
		const Detected = Language(Key);
		if (Detected === undefined) {
			return Skip("unsupported language");
		}
		if (!StateRef.Config.languages.includes(Detected)) {
			return Skip(`language ${Detected} not enabled`);
		}
		if (typeof Info.size === "number" && Info.size > StateRef.Config.maxFileBytes) {
			return Skip(`file too large (${Info.size} > ${StateRef.Config.maxFileBytes} bytes)`);
		}
		const Text = (await Fs.readText(Target)) as string;
		await StateRef.Opened;
		const Parsed = ParseFile(Key, Text, Detected, String(Info.version));
		if (Parsed.nodes.length > StateRef.Config.maxNodesPerFile) {
			return Skip(
				`too many nodes (${Parsed.nodes.length} > ${StateRef.Config.maxNodesPerFile})`,
			);
		}
		const Edges = [
			...Parsed.edges,
			...(await ReferenceEdges(StateRef, Key, Text, Parsed.nodes)),
		];
		const Record = {
			version: String(Info.version),
			fingerprint: Parsed.fileFingerprint,
			nodes: Parsed.nodes,
			edges: Edges,
		};
		const Previous = StateRef.Records.get(Key);
		StateRef.Records.set(Key, Record);
		await Store.put(StateRef, Key, Record);
		StateRef.Revision += 1;
		await Store.putMeta(StateRef, StateRef.Revision);
		StateRef.SkippedImports += Parsed.skipped.length;
		Append(
			StateRef,
			`indexed ${Key} version ${String(Info.version)} (${Parsed.nodes.length} nodes, ${Edges.length} edges)`,
		);
		// The trace (D5): a replaced record invalidates the previous one first
		// (the consumers cached the old version), then the new record is
		// announced. A first index emits only `graph/indexed`. No ledger line
		// is added - the module's strings stay byte-exact.
		if (Previous !== undefined) {
			Emit(StateRef, Invalidated(Key, "replaced", Previous.version));
		}
		Emit(StateRef, Indexed(Key, Record.version, StateRef.Revision));
		return {
			path: Key,
			status: "indexed",
			nodes: Parsed.nodes.length,
			edges: Edges.length,
			version: String(Info.version),
		};
	} catch (Cause) {
		return Fail((Cause as Error)?.message ?? String(Cause));
	}
};
