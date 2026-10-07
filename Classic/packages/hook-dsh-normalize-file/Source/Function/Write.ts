// Write - the `normalize-file` TOOL (`defineTool` from @deepseek-ai/dsh-tools):
// the family's explicit, visible, opt-in door to files ALREADY on disk. The
// stream normalizers (normalize-dash + the five flavors) rewrite model output
// by name-exempting `edit`, `raw-write` and THIS tool's calls (the core's
// Stream/Chunk + Stream/Block): the arguments carry a FILE PATH, and a stream
// flavor normalizing a dash inside a filename would corrupt the target - so a
// call to this tool carries its arguments through the stream untouched, and
// the tool decides everything at execution time.
//
// The exec keeps only what is legitimately caller-side:
//
//   1. `ctx.fs.resolve` - the model-supplied path becomes a stable target
//      (cwd semantics are the caller's, exactly like raw-write);
//   2. ONE call to the shared pipeline (Function/Normalize), which owns the
//      rest: the read (`ctx.fs.readText`), the counting six-fold chain, the
//      N = 0 no-op no-write rule, and - only when N > 0 - the write through
//      the factory's ONE shared write executor (`State.Factory.Write`), so
//      the fs/write-intent waterfall and the fs/observed present emit are
//      handled BY the shared executor, byte-identical with raw-write's
//      posture (the emit on the ROOT context, the call's exec as the actor).
//
// The exec returns the pipeline's outcome; the registry projects it through
// the output schema (path/count/changed, plus before/after when changed) and
// through `presentationMeta`, which the pure `presentResult` narrows back
// into the diff card (the read-tool pattern: the structured before/after
// cannot be reconstructed from the rendered text alone, so they are projected
// through the output declaration and read back from `result.meta`). The
// presenters are PURE functions of the args and the outcome metadata - no
// I/O, no session state, no clock.
//
// The registration is READONLY after registration (the skill's rule): the
// definition object is never mutated - this file only BUILDS it; the
// registration call itself lives in Function/Apply.
import { defineTool } from "@deepseek-ai/dsh-tools";
import Normalize from "./Normalize.js";
import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

export default (Context: Context, State: State) =>
	defineTool({
		name: "normalize-file",
		description:
			"Normalize a file that is ALREADY on disk by applying the normalize family's six transforms (dashes → the module's replacement, curly quotes → straight, ellipsis → ..., unicode spaces → ASCII, invisible characters removed, fullwidth → halfwidth) to its current content and writing the result back. The file is read, replacements are counted, and the write happens ONLY when at least one character changed: a no-op leaves the file byte-identical and writes nothing. Because the file's bytes change under you, re-read before editing - the edit tool's old_string must match the new content. This tool's stream traffic is exempt from the normalize family by name (its arguments carry a file path).",
		parameters: {
			file_path: {
				type: "string",
				required: true,
				description: "Path to the file to normalize, resolved by the filesystem backend.",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					path: {
						type: "string",
						required: true,
					},
					count: {
						type: "number",
						required: true,
					},
					changed: {
						type: "boolean",
						required: true,
					},
					before: {
						oneOf: [{ type: "string" }, { type: "null" }],
					},
					after: {
						type: "string",
					},
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: `<path>${value.path}</path>
<type>file</type>
<content>
${value.changed ? `Normalized ${value.count} character(s)` : "Already normalized (nothing written)"}
</content>`,
				},
			],
			presentationMeta: (_args, value) =>
				value.changed
					? {
							changed: true,
							path: value.path,
							before: value.before ?? null,
							after: value.after ?? "",
						}
					: { changed: false, path: value.path },
		},
		async execute(args, exec) {
			// The caller-side resolve; the shared pipeline owns the rest.
			const target = await Context.fs.resolve(args.file_path, {
				signal: exec.signal,
			});
			const outcome = await Normalize(State, target, exec);
			return outcome.changed
				? {
						path: outcome.path,
						count: outcome.count,
						changed: true,
						before: outcome.before ?? null,
						after: outcome.after ?? "",
					}
				: { path: outcome.path, count: outcome.count, changed: false };
		},
		presentCall(args) {
			// The pending card cannot show content (nothing has been read yet - a
			// call-time presenter has no access to the file's prior content, the
			// same reason an overwrite's call-time diff carries oldText: null), so
			// the diff card is the RESULT card (presentResult, from the outcome's
			// before/after) and the call stays a generic follow-along card.
			return {
				card: "generic",
				kind: "edit",
				title: `Normalize ${args.file_path}`,
				locations: [{ path: args.file_path }],
			};
		},
		presentResult(args, result) {
			if (result.isError) return undefined;
			// The presentation metadata projected by the output declaration
			// (guarded cast - the meta is the tool's own projector's shape).
			const Meta = result.meta as
				| {
						changed?: boolean;
						path?: string;
						before?: string | null;
						after?: string;
				  }
				| undefined;
			if (!Meta || Meta.changed !== true) return undefined;
			return {
				card: "diff",
				title: `Normalize ${args.file_path}`,
				diffs: [
					{
						path: Meta.path ?? args.file_path,
						oldText: Meta.before ?? null,
						newText: Meta.after ?? "",
					},
				],
			};
		},
	});
