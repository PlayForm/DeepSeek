// Bridge - the plain-field bridge's host body: `editFull(namespace, patch)`
// over `ctx.configEditor.edit()` (PHASE-7). The patch is the namespace's
// WHOLE resolved config, so the editor validates it, persists the profile
// patch, and reconciles the Loader exactly as a hand edit would; the audit
// line comes from the editor's own path, never from this package. The body
// refuses, in order:
//
//   * a namespace that is not a non-empty string (`bridge: invalid namespace`);
//   * a patch that is not a plain object (`bridge: invalid patch for <ns>`);
//   * a composition with no config editor (`bridge: config editor unavailable`);
//   * a namespace that names no profile entry (`bridge: unknown namespace`);
//   * a namespace declaring a `role("secret")` field (`bridge: secret
//     namespace refused for <ns>` - the independent host refusal);
//   * an editor rejection (`bridge: write failed for <ns>`).
//
// The `enabled` gate lives in Function/Apply (a disabled package refuses
// every method, the tail/stats rule).
import type { Context } from "@deepseek-ai/cordis";
import Secret from "@Function/Secret.js";
import Lines from "@Variable/Lines.js";

type Entry = {
	options?: { id?: unknown };
	fiber?: { runtime?: { Config?: unknown } };
};

type Editor = {
	entries(): Entry[];
	edit(
		entry: Entry,
		change: (
			current: Record<string, unknown>,
			inherited: Record<string, unknown>,
		) => Record<string, unknown>,
	): Promise<void>;
};

const IsRecord = (Value: unknown): Value is Record<string, unknown> =>
	typeof Value === "object" && Value !== null && !Array.isArray(Value);

export default async function Bridge(
	ctx: Context,
	namespace: unknown,
	patch: unknown,
): Promise<boolean> {
	switch (true) {
		case typeof namespace !== "string" || namespace.length === 0:
			ctx.logger.warn(Lines.invalidNamespace(String(namespace)));
			return false;
		default:
			break;
	}
	const Namespace = namespace as string;
	switch (true) {
		case !IsRecord(patch):
			ctx.logger.warn(Lines.invalid(Namespace));
			return false;
		default:
			break;
	}
	const Editor = ctx.get("configEditor") as Editor | undefined;
	switch (true) {
		case Editor === undefined ||
			typeof Editor.entries !== "function" ||
			typeof Editor.edit !== "function":
			ctx.logger.warn(Lines.unavailable());
			return false;
		default:
			break;
	}
	const Row = Editor.entries().find((Candidate) => Candidate?.options?.id === Namespace);
	if (Row === undefined) {
		ctx.logger.warn(Lines.unknown(Namespace));
		return false;
	}
	if (Secret(Row.fiber?.runtime?.Config)) {
		ctx.logger.warn(Lines.secret(Namespace));
		return false;
	}
	try {
		await Editor.edit(Row, () => patch);
		return true;
	} catch {
		ctx.logger.warn(Lines.failed(Namespace));
		return false;
	}
}
