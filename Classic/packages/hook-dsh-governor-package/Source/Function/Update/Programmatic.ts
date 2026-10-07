// Programmatic — the DEFAULT update mode: the npm-check-updates LIBRARY
// (declared as a bundle dependency; the harness auto-installs plugin
// dependencies into the profile) via run(...) in-process inside the detached
// update continuation — no external binary. THE npm-check-updates library is
// one of the two standing exemptions: it is the one external capability this
// plugin uses. Ledger lines go through the FACTORY (State.Factory.Append —
// the continuation runs in the host process, so the lines land in the same
// ledger directly instead of the old child's inherited fd).
import { join as Join } from "node:path";
import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";

export default async (
	State: State,
	Invocation: Invocation,
	Root: string,
	Groups: string[],
	Concurrency: number,
	Reject: string[],
	Allow: string[] | undefined,
): Promise<boolean> => {
	let Library: Record<string, unknown> | null | undefined;
	try {
		Library = (await import("npm-check-updates")) as Record<string, unknown>;
	} catch (Cause) {
		State.Factory.Append(
			State,
			`update: npm-check-updates library unavailable: ${(Cause as Error)?.message ?? Cause}`,
		);
		return false;
	}
	const Default = Library?.["default"] as Record<string, unknown> | undefined;
	// CJS-with-default packages (npm-check-updates): access `run` defensively
	// (Mod.run ?? Mod.default?.run) — a live-verified pitfall.
	const Run = (Library?.["run"] ?? Default?.["run"] ?? Default) as
		((Options: Record<string, unknown>) => Promise<unknown>) | undefined;
	switch (true) {
		case typeof Run !== "function":
			State.Factory.Append(
				State,
				`update: npm-check-updates run() not found in library exports`,
			);
			return false;
	}
	try {
		const Results = await Run({
			packageFile: Join(Root, "package.json"),
			upgrade: true,
			silent: true,
			dep: Groups,
			concurrency: Concurrency,
			target: Invocation.target,
			...(Reject.length ? { reject: Reject } : {}),
			...(Allow ? { allow: Allow } : {}),
			...(Invocation.filter ? { filter: Invocation.filter } : {}),
		});
		State.Factory.Append(
			State,
			`update: ncu (${Invocation.label}) → ${JSON.stringify(Results ?? {})}`,
		);
		return true;
	} catch (Cause) {
		State.Factory.Append(
			State,
			`update: ncu failed (${Invocation.label}): ${(Cause as Error)?.message ?? Cause}`,
		);
		return false;
	}
};
