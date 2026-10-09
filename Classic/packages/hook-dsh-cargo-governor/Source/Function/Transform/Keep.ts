// Keep — the module's own global keep-file source (config `keepFile`),
// merged into the factory-supplied union keep-list by the transform: the
// factory keep discovery reads State.Policy as its global field, which for
// THIS module is the UPDATE policy, so the keepFile union is the module's
// own concern — with the exact pre-refactor semantics: an unreadable source
// logs `unreadable pin-policy.json at … — using built-in default` and
// contributes nothing. The keep-list wins over full-version NORMALIZATION,
// never over the chain.
import * as FileSystem from "node:fs";
import type PluginFactory from "@playform/plugin-dsh-factory";
import type State from "@Interface/State.js";

export default (Factory: PluginFactory, State: State, Keep: string[]): string[] => {
	const Merged = [...Keep];
	switch (true) {
		case !!State.KeepFile && FileSystem.existsSync(State.KeepFile): {
			const Discovered = Factory.Parse(State.KeepFile) as
				{ keep?: unknown[] } | Record<string, unknown> | unknown[] | null;
			switch (true) {
				case !Discovered || typeof Discovered !== "object" || Array.isArray(Discovered):
					Factory.Append(
						State,
						`unreadable pin-policy.json at ${State.KeepFile} — using built-in default`,
					);
					break;
				default:
					for (const Name of (Discovered as { keep?: unknown[] }).keep ?? []) {
						switch (true) {
							case typeof Name === "string" && !Merged.includes(Name):
								Merged.push(Name);
								break;
						}
					}
			}
			break;
		}
	}
	return Merged;
};
