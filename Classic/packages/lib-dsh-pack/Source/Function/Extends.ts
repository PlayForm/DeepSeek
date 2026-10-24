// Extends - the normalized `extends:` list of a pack: absent is [], a
// scalar is one name, an array is the list. Normalize also normalizes it,
// but the chain reads layers that may not have gone through Normalize.
import type Pack from "../Interface/Pack.js";

export default (Pack: Pack): string[] => {
	const Value = Pack.extends;
	switch (true) {
		case Value === undefined:
			return [];
		case Array.isArray(Value):
			return Value.map(String);
		default:
			return [String(Value)];
	}
};
