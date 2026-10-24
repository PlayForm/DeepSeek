// Plan - the rename semantics (Function/Plan), the service's rename(). The
// rename means different things per format (the .ts symbol vs the .docx
// displayed text vs the .rs item), so the plan is the ADAPTER's answer: the
// adapter computes the edits from its reference list plus its own symbol
// resolution, and an adapter that cannot be certain returns undefined - the
// refusal-to-guess rule (PITFALLS-LOG: the semantic uncertainty per type).
// This service never writes a file: the plan goes to the operate proposals.
//
// THE DEEPENING COMES FIRST: when a deepener is registered for the extension
// (Function/Deepen - the harness LSP seam, Function/Lsp) its scope-resolved
// plan is used when it answers; `undefined` (the seam is absent, has no
// provider, failed, or found no same-file use site) falls through to the
// adapter's lexical plan. The ledger line is the same for both - the plan's
// reach and certainty are the adapter's declared contract.
//
// The model is built on demand: an unresolved path resolves first (the plan
// needs the text and the references).
import Build from "@Function/Build.js";
import Select from "@Function/Select.js";
import type RenamePlan from "@Interface/RenamePlan.js";
import type Span from "@Interface/Span.js";
import type State from "@Interface/State.js";

/** The workspace root the deepener's queries resolve against. */
const Root = (State: State): string => (State.Root.length > 0 ? State.Root : process.cwd());

export default async (
	State: State,
	Path: string,
	Range: Span,
	To: string,
): Promise<RenamePlan | undefined> => {
	switch (true) {
		case !State.On:
			return undefined;
		case typeof To !== "string" || To.length === 0:
			State.Factory.Append(State, `refused ${Path} (rename: empty name)`);
			return undefined;
		default:
	}
	// The adapter is checked BEFORE the model is built: Build already emits
	// its own refusal line for an unadapted extension, and checking after it
	// would log the same refusal twice.
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
	const Model = State.Index.get(Path) ?? (await Build(State, Path));
	switch (true) {
		case !Model:
			State.Factory.Append(State, `refused ${Path} (rename: no model)`);
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
		let Plan: RenamePlan | undefined;
		const Deepening = State.Deepenings.get(Selected.Suffix);
		switch (true) {
			case Deepening === undefined:
				break;
			default:
				try {
					Plan = await Deepening.rename(
						State.Context,
						Root(State),
						Path,
						Text,
						Range,
						To,
					);
				} catch {
					Plan = undefined;
				}
		}
		switch (true) {
			case Plan === undefined:
				Plan = Selected.Adapter.rename(Text, Path, Range, To);
				break;
			default:
		}
		switch (true) {
			case Plan === undefined:
				// The adapter's refusal: never guess on its behalf.
				State.Factory.Append(State, `refused ${Path} (rename: adapter not certain)`);
				return undefined;
			default:
		}
		State.Factory.Append(
			State,
			`planned rename ${Plan.from} -> ${Plan.to} in ${Path} (${Plan.edits.length} edits, ${Plan.certainty})`,
		);
		return Plan;
	} catch (Cause) {
		State.Factory.Append(
			State,
			`failed ${Path} (${Cause instanceof Error ? Cause.message : String(Cause)})`,
		);
		return undefined;
	}
};
