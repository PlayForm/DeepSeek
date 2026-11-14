import { Escape } from "@Function/Normalize.js";
import type {
	AgentState,
	Decision,
	ToolCatalog,
	ToolEntry,
	ToolParam,
} from "@Interface/Execution.js";
import { CLASS_LEADS, TRACEABILITY } from "@Variable/Notes.js";

/**
 * @module Compose
 *
 * The template system: fills the three templates with the decision's data and
 * the fetched catalog entries.
 *
 * @remarks
 *
 * Plan Part 3 §3.3/§3.5 step 4.
 *
 * The fill is a SINGLE-PASS scanner over the template: each `${...}` token is
 * read from the ORIGINAL template and replaced with its value; user data
 * (the ${command} fill) is escaped (`${` -> `$${`) BEFORE insertion, so user
 * content can never add an unfilled placeholder, and inserted values are
 * never re-scanned. A placeholder the catalog cannot fill degrades to its
 * neutral form - composed output never fails on a fetch gap.
 *
 * The note carries the harness's OWN parameter surface, not a paraphrase of
 * it: `${tool.params}` renders every key with its requiredness and its declared
 * default, and `${tool.shape}` renders the call the model should make. That is
 * what makes a suggestion actionable - `read { file_path, offset?, limit? }`
 * answers "what are lines 45200-45240", while `read (key parameter: file_path)`
 * does not.
 */
/**
 * The knob values the composers read (the live State values).
 */
export interface ComposeConfig {
	maxSectionTools: number;
	maxNoteParams: number;
}

/**
 * The entry a note names. A tool absent from the catalog (a user row naming a
 * tool this deployment does not carry) composes to its neutral form.
 */
const EMPTY: ToolEntry = { description: "", param: "", params: [] };

/**
 * The tool entry a note names.
 */
const Entry = (Catalog: ToolCatalog, Name: string): ToolEntry => Catalog.tools.get(Name) ?? EMPTY;

/**
 * Single-pass template fill (no re-scanning of inserted values).
 */
export const Fill = (Template: string, Values: Record<string, string | number>): string => {
	let Output = "";
	let Index = 0;
	while (Index < Template.length) {
		const Start = Template.indexOf("${", Index);
		if (Start === -1) {
			Output += Template.slice(Index);
			break;
		}
		Output += Template.slice(Index, Start);
		const End = Template.indexOf("}", Start + 2);
		if (End === -1) {
			Output += Template.slice(Start);
			break;
		}
		const Token = Template.slice(Start, End + 1);
		const Value = Values[Token];
		Output += Value === undefined ? Token : String(Value);
		Index = End + 1;
	}
	return Output;
};

/**
 * Render the parameter surface the note names, in the schema's own order:
 * `file_path (required), offset (default 1), limit (default 2000)`.
 *
 * The cap keeps a note from turning into a schema dump: a tool with a dozen
 * parameters names the first `maxNoteParams` and reports the remainder as a
 * count, so the model still knows the surface is wider than what it reads.
 */
export const Surface = (Params: ToolParam[], Limit: number): string => {
	if (Params.length === 0) {
		return "none declared";
	}
	const Shown = Params.slice(0, Math.max(1, Limit));
	const Rendered = Shown.map((Param) => {
		if (Param.required) {
			return `${Param.name} (required)`;
		}
		return Param.default === undefined
			? `${Param.name} (optional)`
			: `${Param.name} (default ${Param.default})`;
	});
	if (Params.length > Shown.length) {
		Rendered.push(`+${Params.length - Shown.length} more`);
	}
	return Rendered.join(", ");
};

/**
 * Render the call shape: `read { file_path, offset?, limit? }` (an optional key
 * carries `?`, the convention the model already reads in the tool schema).
 */
export const Shape = (Name: string, Params: ToolParam[]): string => {
	if (!Name) {
		return "the tool's own schema";
	}
	if (Params.length === 0) {
		return `${Name} { }`;
	}
	const Keys = Params.map((Param) => (Param.required ? Param.name : `${Param.name}?`));
	return `${Name} { ${Keys.join(", ")} }`;
};

/**
 * The shared placeholder values for a note about one decision.
 */
const Values = (
	Decision: Decision,
	Catalog: ToolCatalog,
	Config: ComposeConfig,
): Record<string, string | number> => {
	const Match = Decision.match;
	const Name = Match?.tool ?? "";
	const Tool = Entry(Catalog, Name);
	return {
		"${command}": Escape(Match?.command ?? ""),
		"${class}": Match?.class ?? "",
		"${class.lead}": Match === null ? "" : (CLASS_LEADS[Match.class] ?? ""),
		"${count}": Decision.strikes,
		"${traceability}": TRACEABILITY,
		"${tool.name}": Name,
		"${tool.description}": Tool.description,
		"${tool.param}": Tool.param,
		"${tool.params}": Surface(Tool.params, Config.maxNoteParams),
		"${tool.shape}": Shape(Name, Tool.params),
	};
};

/**
 * The tier-1 note text (the fetched description line + the parameter surface).
 */
export const First = (
	Decision: Decision,
	Catalog: ToolCatalog,
	Template: string,
	Config: ComposeConfig,
): string => Fill(Template, Values(Decision, Catalog, Config));

/**
 * The tier-3 deny reason (the same forbidden phrasing).
 */
export const Denied = (
	Decision: Decision,
	Catalog: ToolCatalog,
	Template: string,
	Config: ComposeConfig,
): string => Fill(Template, Values(Decision, Catalog, Config));

/**
 * The tier-2 section text (3 fixed rules + the tool table).
 */
export const Persistent = (
	State: AgentState,
	Catalog: ToolCatalog,
	Template: string,
	Config: ComposeConfig,
	Mapped: string[],
	LiveNames: string[],
): string => {
	const Values_: Record<string, string | number> = {
		"${command}": Escape(State.lastCommand),
		"${traceability}": TRACEABILITY,
	};

	// The table: the pattern-table-mapped tools first (in the plan's class
	// priority order, then first appearance), topped up with the remaining
	// live tools alphabetically, capped at maxSectionTools rows.
	const Ordered: string[] = [];
	for (const Name of Mapped) {
		if (!Ordered.includes(Name)) {
			Ordered.push(Name);
		}
	}
	for (const Name of [...LiveNames].sort()) {
		if (!Ordered.includes(Name)) {
			Ordered.push(Name);
		}
	}
	const Rows: string[] = [];
	for (const Name of Ordered.slice(0, Math.max(1, Config.maxSectionTools))) {
		const Tool = Entry(Catalog, Name);
		Rows.push(`| ${Name} | ${Tool.description || "see the tool's schema"} |`);
	}
	Values_["${table}"] = Rows.join("\n");
	return Fill(Template, Values_);
};
