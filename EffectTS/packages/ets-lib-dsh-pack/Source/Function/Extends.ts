import type Pack from "../Interface/Pack.js";

/**
 * @module Extends
 *
 * Reads the normalized `extends:` list of a pack.
 *
 * @remarks
 *
 * An absent `extends` is an empty list, a scalar is one name, and an array is
 * the list. Normalize also normalizes it, but the chain reads layers that may
 * not have gone through Normalize.
 */
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
