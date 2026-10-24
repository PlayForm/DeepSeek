// Parse - a STRICT YAML-SUBSET parser for the pack schema. The workspace
// does not carry the `yaml` package in its own dependency graph (the symbol
// only resolves through the enclosing machine's pnpm store, which a checkout
// elsewhere would not have), so the library stays dependency-light and
// parses the documented subset itself. Supported:
//
//   * block mappings (`key: value`, nested by indentation);
//   * block sequences (`- value`, `- key: value` map items, nested blocks);
//   * scalars: plain, single-quoted (`''` escapes), double-quoted (JSON
//     escapes), true/false, null/~, integers and decimals;
//   * flow sequences of scalars (`[a, b]`), the empty flow `[]` and `{}`;
//   * comments (`#` at the line start or after whitespace), blank lines,
//     `---` / `...` document markers.
//
// NOT supported (the parser throws a line-numbered error, never guesses):
// tabs, anchors/aliases (`&name`, `*name`), tags (`!tag`), block scalars
// (`|`, `>`), non-empty flow mappings (`{a: b}`), multi-document files,
// duplicate keys, and a sequence map item whose following keys are not
// aligned under the item's content. Documented in SCHEME.md.
interface Row {
	indent: number;
	text: string;
	number: number;
}

type Node = null | boolean | number | string | Node[] | { [Key: string]: Node };

/** Strip a comment (a `#` at the start or after whitespace, outside quotes). */
const Strip = (Line: string): string => {
	let Single = false;
	let Double = false;
	for (let Index = 0; Index < Line.length; Index += 1) {
		const Char = Line.charAt(Index);
		switch (true) {
			case Double:
				if (Char === "\\") {
					Index += 1;
				} else if (Char === '"') {
					Double = false;
				}
				break;
			case Single:
				if (Char === "'") {
					if (Line.charAt(Index + 1) === "'") {
						Index += 1;
					} else {
						Single = false;
					}
				}
				break;
			case Char === '"':
				Double = true;
				break;
			case Char === "'":
				Single = true;
				break;
			case Char === "#" && (Index === 0 || /\s/.test(Line.charAt(Index - 1))):
				return Line.slice(0, Index);
			default:
				break;
		}
	}
	return Line;
};

/** The significant rows: comments and blank lines dropped, tabs rejected. */
const Lex = (Text: string): Row[] => {
	const Rows: Row[] = [];
	const Raw = Text.split(/\r?\n/);
	for (let Index = 0; Index < Raw.length; Index += 1) {
		const Line = Raw[Index] ?? "";
		const Number_ = Index + 1;
		if (Line.includes("\t")) {
			throw new Error(`line ${Number_}: tabs are not supported (use spaces)`);
		}
		const Stripped = Strip(Line);
		const Trimmed = Stripped.trim();
		if (Trimmed === "" || Trimmed === "---" || Trimmed === "...") {
			continue;
		}
		const Indent = Stripped.length - Stripped.trimStart().length;
		Rows.push({ indent: Indent, text: Trimmed, number: Number_ });
	}
	return Rows;
};

/** The first top-level `:` (outside quotes) whose next char is a space or end. */
const Colon = (Text: string): number => {
	let Single = false;
	let Double = false;
	for (let Index = 0; Index < Text.length; Index += 1) {
		const Char = Text.charAt(Index);
		if (Double) {
			if (Char === "\\") {
				Index += 1;
			} else if (Char === '"') {
				Double = false;
			}
			continue;
		}
		if (Single) {
			if (Char === "'") {
				if (Text.charAt(Index + 1) === "'") {
					Index += 1;
				} else {
					Single = false;
				}
			}
			continue;
		}
		if (Char === '"') {
			Double = true;
			continue;
		}
		if (Char === "'") {
			Single = true;
			continue;
		}
		if (Char === ":" && (Index + 1 === Text.length || Text.charAt(Index + 1) === " ")) {
			return Index;
		}
	}
	return -1;
};

/** Split a flow sequence's inner text on its top-level commas. */
const Split = (Text: string): string[] => {
	const Parts: string[] = [];
	let Start = 0;
	let Single = false;
	let Double = false;
	for (let Index = 0; Index < Text.length; Index += 1) {
		const Char = Text.charAt(Index);
		if (Double) {
			if (Char === "\\") {
				Index += 1;
			} else if (Char === '"') {
				Double = false;
			}
			continue;
		}
		if (Single) {
			if (Char === "'") {
				if (Text.charAt(Index + 1) === "'") {
					Index += 1;
				} else {
					Single = false;
				}
			}
			continue;
		}
		if (Char === '"') {
			Double = true;
			continue;
		}
		if (Char === "'") {
			Single = true;
			continue;
		}
		if (Char === ",") {
			Parts.push(Text.slice(Start, Index).trim());
			Start = Index + 1;
		}
	}
	Parts.push(Text.slice(Start).trim());
	return Parts.filter((Part) => Part !== "");
};

/** A flow collection: `[]`, `[scalars]` or `{}`. */
const Flow = (Text: string, Number_: number): Node => {
	switch (true) {
		case Text === "[]":
			return [];
		case Text === "{}":
			return {};
		case Text.startsWith("[") && Text.endsWith("]"): {
			const Inner = Text.slice(1, -1).trim();
			return Inner === "" ? [] : Split(Inner).map((Part) => Scalar(Part, Number_));
		}
		default:
			throw new Error(
				`line ${Number_}: only [] / [scalars] / {} flow collections are supported`,
			);
	}
};

/** One scalar. */
const Scalar = (Text: string, Number_: number): Node => {
	const Trimmed = Text.trim();
	if (Trimmed === "") {
		return null;
	}
	const First = Trimmed.charAt(0);
	switch (true) {
		case First === "!":
			throw new Error(`line ${Number_}: tags are not supported`);
		case First === "&" && /^&[A-Za-z0-9_-]+(?:\s|$)/.test(Trimmed):
			throw new Error(`line ${Number_}: anchors are not supported`);
		case First === "*" && /^\*[A-Za-z0-9_-]+$/.test(Trimmed):
			throw new Error(`line ${Number_}: aliases are not supported`);
		case First === "|" || First === ">":
			throw new Error(`line ${Number_}: block scalars are not supported`);
		case First === '"': {
			if (Trimmed.length < 2 || !Trimmed.endsWith('"')) {
				throw new Error(`line ${Number_}: an unterminated double-quoted scalar`);
			}
			try {
				const Parsed: unknown = JSON.parse(Trimmed);
				if (typeof Parsed !== "string") {
					throw new Error("not a string");
				}
				return Parsed;
			} catch {
				throw new Error(`line ${Number_}: an invalid double-quoted scalar`);
			}
		}
		case First === "'": {
			if (Trimmed.length < 2 || !Trimmed.endsWith("'")) {
				throw new Error(`line ${Number_}: an unterminated single-quoted scalar`);
			}
			return Trimmed.slice(1, -1).replace(/''/g, "'");
		}
		case First === "[" || First === "{":
			return Flow(Trimmed, Number_);
		case Trimmed === "null" || Trimmed === "~":
			return null;
		case Trimmed === "true":
			return true;
		case Trimmed === "false":
			return false;
		case /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(Trimmed):
			return Number(Trimmed);
		default:
			return Trimmed;
	}
};

/** One `key: value` entry. */
const Entry = (Text: string, Number_: number): { Key: string; Value: string } => {
	const Index = Colon(Text);
	if (Index < 0) {
		throw new Error(`line ${Number_}: expected "key: value"`);
	}
	const Key = Text.slice(0, Index).trim();
	if (Key === "") {
		throw new Error(`line ${Number_}: an empty key`);
	}
	const Parsed = Scalar(Key, Number_);
	if (typeof Parsed !== "string") {
		throw new Error(`line ${Number_}: the key must be a string`);
	}
	return { Key: Parsed, Value: Text.slice(Index + 1).trim() };
};

/** Whether a row is a block-sequence item. */
const IsItem = (Text: string): boolean => Text === "-" || Text.startsWith("- ");

/** One block: a mapping or a sequence at the given indentation. */
const Block = (Rows: Row[], Index: number, Indent: number): [Node, number] => {
	const Row = Rows[Index];
	if (Row === undefined) {
		return [null, Index];
	}
	if (Row.indent !== Indent) {
		throw new Error(`line ${Row.number}: unexpected indentation`);
	}
	return IsItem(Row.text) ? Sequence(Rows, Index, Indent) : Mapping(Rows, Index, Indent);
};

/** One block mapping. */
const Mapping = (Rows: Row[], Index: number, Indent: number): [Node, number] => {
	const Result: { [Key: string]: Node } = {};
	let Current = Index;
	while (Current < Rows.length) {
		const Row = Rows[Current];
		if (Row === undefined) {
			break;
		}
		if (Row.indent < Indent) {
			break;
		}
		if (Row.indent > Indent) {
			throw new Error(`line ${Row.number}: unexpected indentation`);
		}
		if (IsItem(Row.text)) {
			break;
		}
		const Split_ = Entry(Row.text, Row.number);
		if (Split_.Key in Result) {
			throw new Error(`line ${Row.number}: duplicate key ${Split_.Key}`);
		}
		if (Split_.Value === "") {
			const Next = Rows[Current + 1];
			if (Next !== undefined && Next.indent > Indent) {
				const [Value, End] = Block(Rows, Current + 1, Next.indent);
				Result[Split_.Key] = Value;
				Current = End;
			} else {
				Result[Split_.Key] = null;
				Current += 1;
			}
		} else {
			Result[Split_.Key] = Scalar(Split_.Value, Row.number);
			Current += 1;
		}
	}
	return [Result, Current];
};

/** One block sequence. */
const Sequence = (Rows: Row[], Index: number, Indent: number): [Node, number] => {
	const Result: Node[] = [];
	let Current = Index;
	while (Current < Rows.length) {
		const Row = Rows[Current];
		if (Row === undefined) {
			break;
		}
		if (Row.indent < Indent) {
			break;
		}
		if (Row.indent > Indent) {
			throw new Error(`line ${Row.number}: unexpected indentation`);
		}
		if (!IsItem(Row.text)) {
			break;
		}
		const Content = Row.text.slice(1).trimStart();
		if (Content === "") {
			const Next = Rows[Current + 1];
			if (Next !== undefined && Next.indent > Indent) {
				const [Value, End] = Block(Rows, Current + 1, Next.indent);
				Result.push(Value);
				Current = End;
			} else {
				Result.push(null);
				Current += 1;
			}
		} else {
			const Column = Indent + (Row.text.length - Content.length);
			if (Colon(Content) >= 0) {
				Rows[Current] = { indent: Column, text: Content, number: Row.number };
				const [Value, End] = Mapping(Rows, Current, Column);
				Result.push(Value);
				Current = End;
			} else {
				Result.push(Scalar(Content, Row.number));
				Current += 1;
			}
		}
	}
	return [Result, Current];
};

export default (Text: string): unknown => {
	const Rows = Lex(Text);
	const First = Rows[0];
	if (First === undefined) {
		return null;
	}
	const [Value, End] = Block(Rows, 0, First.indent);
	const Leftover = Rows[End];
	if (Leftover !== undefined) {
		throw new Error(`line ${Leftover.number}: unexpected indentation`);
	}
	return Value;
};
