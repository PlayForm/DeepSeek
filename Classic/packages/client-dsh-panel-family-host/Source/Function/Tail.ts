// Tail - the tail(namespace, lines) method. The namespace must match the
// family module-name pattern (lowercase letters, digits, hyphens) - anything
// else, including any path separator or dot, is rejected (`rejected`), not
// sanitized: the endpoint never opens a path its namespace pattern didn't
// produce. The log path is `<logRoot>/<namespace>.log` with the leading `~`
// resolved to os.homedir(). Read-only: one openFileSync-equivalent read, no
// write surface.
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const PATTERN = /^[a-z0-9-]+$/;

export type TailResult =
	| { ok: true; namespace: string; lines: string[] }
	| { ok: false; code: "rejected" | "not-found"; message: string };

export default async function Tail(
	logRoot: string,
	maxLines: number,
	namespace: string,
	lines: number,
): Promise<TailResult> {
	switch (true) {
		case !PATTERN.test(namespace):
			return {
				ok: false,
				code: "rejected",
				message: `namespace "${namespace}" is not a family module name`,
			};
		case !Number.isInteger(lines) || lines < 1:
			return {
				ok: false,
				code: "rejected",
				message: `lines ${lines} is not a positive integer`,
			};
	}
	const count = Math.min(lines, maxLines);
	const path = join(logRoot.replace(/^~/, homedir()), `${namespace}.log`);
	let text: string;
	try {
		text = await readFile(path, "utf8");
	} catch (error) {
		return {
			ok: false,
			code: "not-found",
			message: `log "${namespace}.log" is unreadable: ${String(error)}`,
		};
	}
	const all = text.split("\n");
	if (all.length > 0 && all[all.length - 1] === "") all.pop();
	return { ok: true, namespace, lines: all.slice(-count) };
}
