/**
 * @module Fold
 *
 * Turns one session event into a Touch, the history unit.
 *
 * @remarks
 * Only `tool/call` events count, the arguments arrive either as a JSON string
 * (parsed defensively - a malformed payload is skipped, never thrown) or as an
 * already-parsed object, and the first path-shaped field that is a non-empty
 * string names the touched file. The path is normalized (backslashes become
 * slashes, a leading `./` is stripped) so the fold can group calls by path.
 */
import type Touch from "../Interface/Touch.js";

/**
 * The first path field the fold recognizes, in its precedence order.
 */
const PathKeys = ["file_path", "path", "filePath"] as const;

/**
 * The arguments as a mapping, or undefined when they carry no mapping.
 */
const Payload = (Arguments: unknown): Record<string, unknown> | undefined => {
	if (typeof Arguments === "string") {
		try {
			const Parsed: unknown = JSON.parse(Arguments);
			if (Parsed !== null && typeof Parsed === "object") {
				return Parsed as Record<string, unknown>;
			}
			return undefined;
		} catch {
			return undefined;
		}
	}
	if (Arguments !== null && typeof Arguments === "object") {
		return Arguments as Record<string, unknown>;
	}
	return undefined;
};

/**
 * The path the call named, backslashes to slashes, no leading `./`.
 */
const Clean = (Value: string): string => Value.replaceAll("\\", "/").replace(/^\.\//, "");

export default (
	Event: { readonly type?: string; readonly name?: string; readonly arguments?: unknown },
	Seq: number,
): Touch | undefined => {
	if (Event.type !== "tool/call") {
		return undefined;
	}
	const Fields = Payload(Event.arguments);
	if (Fields === undefined) {
		return undefined;
	}
	for (const Key of PathKeys) {
		const Value = Fields[Key];
		if (typeof Value === "string" && Value.length > 0) {
			return { seq: Seq, path: Clean(Value), tool: Event.name ?? "" };
		}
	}
	return undefined;
};
