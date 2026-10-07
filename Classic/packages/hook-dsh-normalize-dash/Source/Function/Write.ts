// Write - the RAW-WRITE tool (`raw-write`): the plugin-registered sibling of
// the harness's built-in `write` tool with an EXPLICIT `normalize` parameter.
// The stream normalizers (hook-dsh-normalize-dash + the five flavors) rewrite model output by
// name-exempting only `edit` and `raw-write` tool calls (the core's
// Stream/Chunk + Stream/Block), so a call to THIS tool carries its content
// through the stream untouched and decides at execution time:
//
//   * `normalize` absent or false (the DEFAULT) - the content is written
//     VERBATIM, byte-for-byte;
//   * `normalize: true` or `"all"` - the family's SIX transforms are applied
//     to the content first (the legacy behavior, byte-equivalent);
//   * `normalize: ["dash", ...]` - ONLY the selected flavors, applied in the
//     family's fixed order (Function/Rewrite: Dashes with the module's
//     configured `replacement`, Quotes, Ellipsis, Spaces, Invisible,
//     Fullwidth). The parameter is declared as a UNION (boolean | "all" |
//     the flavor-name array) - the harness tools reject unknown keys, so the
//     schema must declare the whole selection shape.
//
//   * `govern` absent or false (the DEFAULT) - NO governance chain (the
//     "skip everything" escape hatch: NO steps run, through either path);
//   * `govern: true` or `"all"` - ALL registered governance steps for the
//     target's basename;
//   * `govern: ["canonicalize", ...]` - ONLY the named steps. After a
//     SUCCESSFUL write the exec AWAITS the factory's direct-govern entry
//     (`await State.Factory.Govern(target, selection, Wrapped,
//     outcome.version)`) inside the existing try/catch - the SEQUENTIAL FOLD
//     (factory v0.2.1): the registered steps run one at a time, each step's
//     chain completing (its guarded write + its ledger line) before the next
//     step reads the file, so the tool's result returns AFTER the governance
//     completes and the steps' version-guarded writes can never race. The
//     update step's awaited promise is fast - its dispatch resolves when the
//     stage is dispatched, not when the background job finishes - so the
//     ledger still shows the progress as today. Best-effort, contained: the
//     registered steps can never affect the write's outcome (the catch below
//     keeps it intact). With no steps registered for the basename the call
//     is a contained no-op.
//
// The DIRECT path is this tool's ONLY governance channel: the exec passes
// its actor to the shared executor WRAPPED as `{ ...exec, govern: <mapped
// selection> }` (absent/false -> `false`, true/"all" -> `true`, an array ->
// the array itself - the value is informational, the factory's gate checks
// only PRESENCE). The marker makes the event path skip the write's
// fs/observed emit entirely (the gate's "govern" reason), so a governed
// manifest never fires the chain twice - the steps run once, from the
// direct call above. The spread preserves every exec field (name, callId,
// agent, signal...), so the harness's own listeners (the observation
// policy's owner derivation, the skill-filesystem's `"name" in actor`
// narrowing) and the direct steps' handlers keep working unchanged; the
// GuardedWrite and Refresh re-emits inside the chain pass carry the SAME
// wrapped actor, so they are skipped too (no double processing - the Stash
// idempotence stays as the second guard).
//
// The fs path is the factory's ONE shared write executor (`State.Factory.Write`
// - factory SCHEME.md §2.7), which mirrors the built-in write's fs path EXACTLY
// (so the fs/observed chain still fires for these writes the same way it fires
// for built-in writes - only the governance listeners now skip the event via
// the `govern` marker above). The exec keeps only what is
// legitimately caller-side:
//
//   1. `ctx.fs.resolve` - the model-supplied path becomes a stable target;
//   2. ONE `Factory.Write(State, target, content, { signal, actor, policy:
//      "standing", transform })` call, which runs the rest of the pipeline:
//      the `fs/write-intent` waterfall (the observation policy's single-slot
//      guarded-write decision, with `next()` delegating to the unconditional
//      default), the standing sandbox policy (the same resolution the
//      built-in's FsSandboxController performs when no escalation is
//      requested - raw-write advertises NO escalation of its own), the
//      `writeText(target, content, intent, exec.signal, policy)` call, and
//      the `fs/observed { kind: "present", version }` emit - ON THE ROOT
//      CONTEXT, the built-in write's own posture (the built-in's ctx IS the
//      root; a plugin-scope emit would never be heard by the governance
//      hooks' sibling scopes);
//   3. the optional `Govern` call (see above), AWAITED inside its own
//      try/catch (the sequential fold: the tool's result returns after the
//      governance completes; the contained catch keeps the write's outcome
//      intact even for a registry-level surprise).
//
// `exec.signal` is honored end to end: it cancels the resolve and the write,
// and the registry rejects a pre-aborted invocation before the body runs.
//
// The registration is READONLY after registration (the skill's rule): the
// definition object is never mutated - this file only BUILDS it; the
// registration call itself lives in Function/Apply (the wire-up, after the
// llm/stream Wire). The presenters are PURE functions of the args (the
// normalization they show is recomputed through the same Function/Rewrite
// chain the exec uses - no I/O, no session state, no clock).
import { defineTool } from "@deepseek-ai/dsh-tools";
import Rewrite from "./Rewrite.js";
import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

// The union shapes (the harness tools reject unknown keys - the schema must
// declare the whole selection form for both flags). Declared `as const` so
// the tool's argument inference stays precise (boolean | "all" | the enum
// array) and the schema compiles to the exact-one union the tools pipeline
// enforces.
const FlavorUnion = [
	{ type: "boolean" },
	{ type: "string", enum: ["all"] },
	{
		type: "array",
		items: {
			type: "string",
			enum: ["dash", "quotes", "ellipsis", "spaces", "invisible", "fullwidth"],
		},
	},
] as const;
const StepUnion = [
	{ type: "boolean" },
	{ type: "string", enum: ["all"] },
	{
		type: "array",
		items: {
			type: "string",
			enum: ["canonicalize", "pin", "cargo", "update"],
		},
	},
] as const;

export default (Context: Context, State: State) => {
	// The content as the tool will WRITE it: verbatim by default, the
	// selection-aware chain when the call asks for normalization (shared by
	// the exec and the presenters, so the card and the file can never
	// disagree).
	const AsWritten = (
		Content: string,
		Normalize: boolean | string | string[] | null | undefined,
	): string =>
		// An absent flag reaches Rewrite as an explicit undefined - which the
		// chain resolves to the verbatim branch (no default-parameter coercion).
		Rewrite(Content, State.Replacement, Normalize === undefined ? false : Normalize);

	return defineTool({
		name: "raw-write",
		description:
			'Create or fully replace a UTF-8 text file, writing the content VERBATIM by default. This tool\'s stream traffic is exempt from the normalize family by name, and normalization is an explicit per-call choice: set normalize to true (or "all") to apply the family\'s six transforms (dashes → the module\'s replacement, curly quotes → straight, ellipsis → ..., unicode spaces → ASCII, invisible characters removed, fullwidth → halfwidth), or set normalize to an array of those flavor names to apply ONLY the selected transforms, in that fixed order; leave it off to write the bytes exactly as given. Optionally, set govern to true to run ALL registered governance steps for the target\'s basename after the write (the package.json/Cargo.toml chain passes and update stages), or to an array of step names ("canonicalize", "pin", "cargo", "update") to run only those; governance is best-effort and never affects the write\'s outcome. Leave govern off (the default) for no governance chain.',
		parameters: {
			file_path: {
				type: "string",
				required: true,
				description: "Path to write, resolved by the filesystem backend.",
			},
			content: {
				type: "string",
				required: true,
				description: "Full UTF-8 text content to write.",
			},
			normalize: {
				oneOf: FlavorUnion,
				description:
					"The normalization selection: true or \"all\" applies the family's six transforms (dashes → the module's replacement, curly quotes → straight, ellipsis → ..., unicode spaces → ASCII, invisible characters removed, fullwidth → halfwidth) in that fixed order; an array of those flavor names applies ONLY the selected transforms, in the same order; false or absent (the default) writes the content verbatim.",
			},
			govern: {
				oneOf: StepUnion,
				description:
					'The governance selection: after a successful write, true or "all" runs ALL registered governance steps for the target\'s basename; an array of step names ("canonicalize", "pin", "cargo", "update") runs only those; unknown names are ignored; false or absent (the default) runs no governance chain. Best-effort - never affects the write\'s outcome.',
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
					operation: {
						type: "string",
						required: true,
						enum: ["create", "update"],
					},
					before: {
						required: true,
						oneOf: [{ type: "string" }, { type: "null" }],
					},
					after: {
						type: "string",
						required: true,
					},
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: `<path>${value.path}</path>
<type>file</type>
<content>
${value.operation === "create" ? "Created" : "Updated"} file
</content>`,
				},
			],
		},
		async execute(args, exec) {
			// The caller-side resolve; the executor owns the rest of the pipeline.
			const target = await Context.fs.resolve(args.file_path, {
				signal: exec.signal,
			});
			// The governance marker (see the header): the actor handed to the
			// shared executor is the exec WRAPPED with the `govern` selection -
			// presence is what the factory's gate checks (the event path skips
			// this write's governance; the direct `Govern` call below is the only
			// channel). The mapping is the design's: absent/false -> false,
			// true/"all" -> true, an array -> the array itself.
			const Wrapped: object = {
				...exec,
				govern:
					args.govern === true || args.govern === "all"
						? true
						: Array.isArray(args.govern)
							? args.govern
							: false,
			};
			const outcome = await State.Factory.Write(State, target, args.content, {
				signal: exec.signal,
				actor: Wrapped,
				policy: "standing",
				transform: (content) => AsWritten(content, args.normalize),
			});
			// The optional governance chain: best-effort, AWAITED (the sequential
			// fold - the registered steps run one at a time, each chain completing
			// before the next step reads the file), after the successful write,
			// with the written outcome's fresh version. The update step's awaited
			// promise is fast (the dispatch, not the background job). Never
			// affects the write's outcome (the factory's Govern is contained per
			// step; the try/catch here covers even a registry-level surprise).
			switch (true) {
				case args.govern === true:
				case args.govern === "all":
				case Array.isArray(args.govern):
				case typeof args.govern === "string" && args.govern.length > 0:
					try {
						await State.Factory.Govern(
							target,
							args.govern,
							// The SAME wrapped actor the write used (NOT the plain exec):
							// every Refresh re-emit inside the direct steps' chain passes
							// carries the `govern` marker, so the event-path listeners
							// skip them too - no cross-module re-processing, no Follow,
							// no update dispatch, no second pinner pass.
							Wrapped,
							outcome.version,
						);
					} catch {
						/* contained - the write's outcome is already sealed */
					}
					break;
			}
			return {
				path: target.displayPath,
				operation: outcome.operation,
				before: outcome.before,
				after: outcome.after,
			};
		},
		presentCall(args) {
			return {
				card: "diff",
				title: `Write ${args.file_path}`,
				diffs: [
					{
						path: args.file_path,
						oldText: null,
						newText: AsWritten(args.content, args.normalize),
					},
				],
				locations: [{ path: args.file_path }],
			};
		},
		presentResult(args, result) {
			if (result.isError) return undefined;
			// No presentationMeta: the completed diff is the whole-file view (the
			// same fallback shape the built-in write uses when meta is absent),
			// computed from the same AsWritten content the exec wrote.
			return {
				card: "diff",
				title: `Write ${args.file_path}`,
				diffs: [
					{
						path: args.file_path,
						oldText: null,
						newText: AsWritten(args.content, args.normalize),
					},
				],
			};
		},
	});
};
