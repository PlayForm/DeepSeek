// Compose - the template system (plan Part 3 §3.3/§3.5 step 4). Fills the
// three templates with the decision's data and the fetched catalog entries.
//
// The fill is a SINGLE-PASS scanner over the template: each `${...}` token is
// read from the ORIGINAL template and replaced with its value; user data
// (the ${command} fill) is escaped (`${` -> `$${`) BEFORE insertion, so user
// content can never add an unfilled placeholder, and inserted values are
// never re-scanned. Any placeholder missing a fetched value degrades to the
// static line (Variable/Notes.STATIC_TOOL_LINES) - composed output never
// fails on a fetch gap.
import { Escape } from "@Function/Normalize.js";
import type { AgentState, Decision, ToolCatalog, ToolEntry } from "@Interface/Execution.js";
import { STATIC_TOOL_LINES, TRACEABILITY } from "@Variable/Notes.js";

/** The knob values the composers read (the live State values). */
export interface ComposeConfig {
	maxSectionTools: number;
}

/** The tool entry a note names, with the static fallback applied. */
const Entry = (Catalog: ToolCatalog, Name: string): ToolEntry => {
	const Live = Catalog.tools.get(Name);
	if (Live) {
		return Live;
	}
	const Static = STATIC_TOOL_LINES[Name];
	return {
		description: Static?.description ?? "",
		param: Static?.param ?? "",
	};
};

/** Single-pass template fill (no re-scanning of inserted values). */
export const Fill = (
	Template: string,
	Values: Record<string, string | number>,
): string => {
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

/** The shared placeholder values for a note about one decision. */
const Values = (Decision: Decision, Catalog: ToolCatalog): Record<string, string | number> => {
	const Match = Decision.match;
	const Name = Match?.tool ?? "";
	const Tool = Entry(Catalog, Name);
	return {
		"${command}": Escape(Match?.command ?? ""),
		"${class}": Match?.class ?? "",
		"${count}": Decision.strikes,
		"${traceability}": TRACEABILITY,
		"${tool.name}": Name,
		"${tool.description}": Tool.description,
		"${tool.param}": Tool.param,
	};
};

/** The tier-1 note text (the fetched description line + traceability). */
export const First = (
	Decision: Decision,
	Catalog: ToolCatalog,
	Template: string,
): string => Fill(Template, Values(Decision, Catalog));

/** The tier-3 deny reason (the same forbidden phrasing). */
export const Denied = (
	Decision: Decision,
	Catalog: ToolCatalog,
	Template: string,
): string => Fill(Template, Values(Decision, Catalog));

/** The tier-2 section text (3 fixed rules + the tool table). */
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
