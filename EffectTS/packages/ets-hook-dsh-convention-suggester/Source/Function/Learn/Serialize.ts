// Serialize - the proposal serializer: one pack object to the SAME YAML
// subset the library parses (Function/Parse in @playform/ets-lib-dsh-pack), so a
// proposal round-trips through `Parse` -> `Normalize` byte-for-byte as data.
// The subset is deliberately small and the output is deterministic:
//
//   * every mapping key and every string is DOUBLE-QUOTED via JSON.stringify
//     (the parser's double-quote branch is JSON.parse, so the escaping rules
//     are exactly JSON's - no YAML block scalars, no anchors, no tags);
//   * numbers and booleans are plain scalars, null is `null`;
//   * empty collections are the flow forms `[]` / `{}`;
//   * non-empty arrays are block sequences, one item per line; a mapping item
//     starts on the dash line and its later keys align under the item's
//     content (the parser's sequence-map rule);
//   * nested blocks indent by FOUR spaces (the parser accepts any consistent
//     width; four keeps the output readable).
//
// The parser REFUSES tabs, so the serializer never emits one. Unsupported
// values (undefined, NaN, nested arrays) throw - a serializer that guessed
// would emit a file the parser rejects later, at load time.
import type { Pack } from "@playform/ets-lib-dsh-pack";

/** The JSON-safe value tree the serializer emits. */
type Node = null | boolean | number | string | Node[] | { [Key: string]: Node };

/** One indentation run. */
const Pad = (Width: number): string => " ".repeat(Width);

/** One scalar, quoted or plain. */
const Scalar = (Value: null | boolean | number | string): string => {
	switch (true) {
		case typeof Value === "string":
			return JSON.stringify(Value);
		case typeof Value === "number" && Number.isFinite(Value):
			return String(Value);
		case typeof Value === "boolean":
			return String(Value);
		case Value === null:
			return "null";
		default:
			throw new Error(`the pack serializer cannot emit a ${typeof Value}`);
	}
};

/** A value rendered on the key's own line, or undefined for a block. */
const Inline = (Value: Node): string | undefined => {
	switch (true) {
		case Array.isArray(Value):
			return Value.length === 0 ? "[]" : undefined;
		case Value !== null && typeof Value === "object":
			return Object.keys(Value).length === 0 ? "{}" : undefined;
		default:
			return Scalar(Value as null | boolean | number | string);
	}
};

/** One block mapping at the given indentation. */
const Mapping = (Value: { [Key: string]: Node }, Indent: number): string[] => {
	const Lines: string[] = [];
	for (const [Key, Field] of Object.entries(Value)) {
		const Label = `${Pad(Indent)}${JSON.stringify(Key)}:`;
		const Flat = Inline(Field);
		if (Flat !== undefined) {
			Lines.push(`${Label} ${Flat}`);
			continue;
		}
		Lines.push(Label);
		Lines.push(...Render(Field, Indent + 4));
	}
	return Lines;
};

/** One block sequence at the given indentation. */
const Sequence = (Value: Node[], Indent: number): string[] => {
	const Lines: string[] = [];
	for (const Item of Value) {
		const Flat = Inline(Item);
		if (Flat !== undefined) {
			Lines.push(`${Pad(Indent)}- ${Flat}`);
			continue;
		}
		if (Array.isArray(Item)) {
			throw new Error("the pack serializer does not emit nested sequences");
		}
		const Rows = Mapping(Item as { [Key: string]: Node }, Indent + 2);
		const First = Rows[0];
		if (First === undefined) {
			Lines.push(`${Pad(Indent)}- {}`);
			continue;
		}
		Lines.push(`${Pad(Indent)}- ${First.slice(Indent + 2)}`);
		Lines.push(...Rows.slice(1));
	}
	return Lines;
};

/** One block value at the given indentation. */
const Render = (Value: Node, Indent: number): string[] => {
	const Flat = Inline(Value);
	if (Flat !== undefined) {
		return [`${Pad(Indent)}${Flat}`];
	}
	return Array.isArray(Value)
		? Sequence(Value, Indent)
		: Mapping(Value as { [Key: string]: Node }, Indent);
};

export default (Pack: Pack): string => `${Render(Pack as unknown as Node, 0).join("\n")}\n`;
