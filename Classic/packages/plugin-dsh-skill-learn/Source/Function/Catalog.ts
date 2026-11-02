// Catalog - the skill catalog's rows to the index lines the phase-1 request
// carries, with the model-invocability filter applied here because the plugin
// bypasses the tool that normally applies it.
//
// WHY THE FILTER IS THE PLUGIN'S JOB: `ctx.skills.list` returns every skill the
// registry resolved, and the `skill` tool is what normally hides a skill whose
// frontmatter disables model invocation (`dsh-skill/lib/index.js:37-47`,
// `Temporary/Research/DESIGN-BRIEF.md:52-54`). A plugin that lists the catalog
// directly gets the unfiltered set, so it must apply the same rule or it will
// offer the model a skill the model is not allowed to load - and then a create
// would be judged `target-absent` against a name the catalog already holds.
//
// THE FLAG IS OPTIONAL AND THE FILTER IS CONDITIONAL ON IT, which is the plan's
// answer to its own open question 1: apply the invocability filter only when the
// row carries the flag, and otherwise rely on the `skill` tool's own gate for the
// model path and on the judge's `target-present` rule for the write path
// (plan section 14, question 1). Filtering on a flag that is absent would hide
// every skill from a provider that does not report it.
//
// ONE LINE PER SKILL, NAME AND DESCRIPTION, and the name alone when the
// description is missing, because the index is a map the model scans, not a
// document: a row that cannot state its description should cost one line rather
// than a `get` call per row (the same answer, plan section 14, question 1).
// Newlines are flattened because a multi-line description would break the one
// line per skill shape the prompt describes (plan section 4.1).
import type { SkillsSlice } from "@Interface/Services.js";

/** Where to list from: the agent's working directory and the run's signal. */
export interface CatalogOptions {
	readonly cwd?: string;
	readonly signal?: AbortSignal;
}

export default async (Skills: SkillsSlice, Options: CatalogOptions): Promise<readonly string[]> => {
	const Rows = await Skills.list(Options);
	const Lines: string[] = [];
	for (const Row of Rows) {
		switch (true) {
			case typeof Row?.name !== "string":
				continue;
			case Row.name.trim() === "":
				continue;
			// The model-invocability filter, applied only when the row reports it.
			case Row.modelInvocable === false:
				continue;
			default:
				break;
		}
		const Name = Row.name.trim();
		const Description =
			typeof Row.description === "string" ? Row.description.replace(/\s+/g, " ").trim() : "";
		Lines.push(Description === "" ? `- ${Name}` : `- ${Name}: ${Description}`);
	}
	return Lines;
};
