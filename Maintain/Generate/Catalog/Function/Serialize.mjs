// Serialize the projected catalog to the byte-exact TypeScript module both
// release trees carry.
//
// The bytes are owned HERE, not by prettier: the file is listed in
// .prettierignore (the marketplace.json precedent), so `pnpm run catalog:check`
// compares the committed file against this serializer's output directly. That
// makes the emitted shape fixed - tabs, double-quoted strings, one property per
// line, a trailing comma everywhere, a single final LF - and any change to it
// is a visible diff rather than a formatter side effect.
const QUOTE = (Value) => JSON.stringify(Value);
const KEY = (Name) => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(Name) ? Name : QUOTE(Name));

const HEADER = `/**
 * @module Catalog
 *
 * GENERATED FILE - DO NOT EDIT BY HAND.
 *
 * The static tool-catalog fallback: every tool the harness ships, projected from
 * the harness's own generated \`docs/tool-catalog.md\`. The harness derives that
 * file by booting each tool plugin on a real context and reading
 * \`ctx.tools.schemas()\`, and its CI re-derives it and fails when it is stale,
 * so a pinned submodule commit is a trustworthy snapshot of the tool contract.
 *
 * Regenerate: \`pnpm run catalog\` - verify: \`pnpm run catalog:check\`.
 * Source: Module/deepseek-harness/docs/tool-catalog.md
 *
 * The runtime owns every formatting decision: Function/Fetch applies the
 * first-sentence cap, derives the primary parameter from the schema's own
 * \`required\` list, and extracts each parameter's default from its description
 * ("Defaults to X.") or its \`default\` annotation. This file therefore stays a
 * dumb, honest projection - it decides nothing.
 */
export interface CatalogParameter {
	readonly description?: string;
	readonly default?: string;
}

export interface CatalogTool {
	readonly description: string;
	readonly parameters: {
		readonly type: "object";
		readonly properties: Readonly<Record<string, CatalogParameter>>;
		readonly required?: readonly string[];
	};
}

export const CATALOG: Readonly<Record<string, CatalogTool>> = {`;

const Parameters = (Parameters, Depth) => {
	const Pad = "\t".repeat(Depth);
	const Entries = Object.entries(Parameters.properties);
	if (Entries.length === 0) {
		return [`${Pad}type: "object",`, `${Pad}properties: {},`];
	}
	const Lines = [`${Pad}type: "object",`, `${Pad}properties: {`];
	for (const [Name, Parameter] of Entries) {
		const Fields = Object.entries(Parameter);
		if (Fields.length === 0) {
			Lines.push(`${Pad}\t${KEY(Name)}: {},`);
			continue;
		}
		Lines.push(`${Pad}\t${KEY(Name)}: {`);
		for (const [Field, Value] of Fields) {
			Lines.push(`${Pad}\t\t${Field}: ${QUOTE(Value)},`);
		}
		Lines.push(`${Pad}\t},`);
	}
	Lines.push(`${Pad}},`);
	if (Parameters.required !== undefined) {
		Lines.push(`${Pad}required: [${Parameters.required.map(QUOTE).join(", ")}],`);
	}
	return Lines;
};

export default (Tools) => {
	const Lines = [HEADER];
	for (const Tool of Tools) {
		Lines.push(`\t${KEY(Tool.name)}: {`);
		Lines.push(`\t\tdescription: ${QUOTE(Tool.description)},`);
		Lines.push("\t\tparameters: {");
		Lines.push(...Parameters(Tool.parameters, 3));
		Lines.push("\t\t},");
		Lines.push("\t},");
	}
	Lines.push("};", "");
	return Lines.join("\n");
};
