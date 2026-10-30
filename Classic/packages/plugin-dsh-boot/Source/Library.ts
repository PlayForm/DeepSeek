// Library - the DETACHED MOUNT RAIL (@playform/plugin-dsh-boot).
//
// One job: keep the PlayForm family off the harness's boot rail. This plugin's
// `apply` does no work beyond scheduling; the plugins named in `mount:` are
// imported and mounted from a later turn, so `runProfile` (and therefore the
// host's `ready` message, and therefore the UI) never waits on them.
//
// Why a later turn rather than a top-level await or a promise the loader
// awaits: the loader mounts bundles sequentially at boot and awaits the tree's
// readiness. Anything that awaits inside `apply` - or a plugin whose own
// `apply` never settles - holds that readiness open, which is exactly the
// failure this rail exists to prevent (a stuck fiber leaves the host at
// "Loading plugins…" forever, with no error anywhere).
//
// CONTAINMENT (defensive, per the family rule): a specifier that fails to
// import, or a plugin whose apply rejects, is logged once as a warning and
// skipped. Nothing here may throw into the rail, and a failure never removes a
// specifier permanently - it is dropped from the mounted set so a later boot
// retries it.
//
// OWN DATA ONLY: this plugin reads nothing and writes nothing. The plugins it
// mounts keep their own state under ~/.dsh/playform/<name>/.
import type { Context } from "@deepseek-ai/cordis";
import Schema from "@deepseek-ai/schemastery";

export const name = "plugin-dsh-boot";

export const Config = Schema.object({
	/** Package specifiers mounted after the harness's own rail is free. */
	mount: Schema.array(String).default([]),
});

/**
 * The specifiers this process has already put on the rail. A fiber can be
 * re-applied (HMR, config hot-reload) while the process keeps running, and a
 * second mount would double-register services and commands.
 */
const Mounted = new Set<string>();

const Mount = async (Context: Context, Specifier: string): Promise<void> => {
	try {
		const Module = (await import(Specifier)) as { default?: unknown };
		await Context.plugin((Module.default ?? Module) as never, {} as never);
	} catch (Error) {
		Mounted.delete(Specifier); // a later boot may succeed
		try {
			Context.logger?.warn?.(`plugin-dsh-boot: ${Specifier} did not mount: ${String(Error)}`);
		} catch {
			/* logger optional - the containment must not depend on it */
		}
	}
};

export const apply = (Context: Context, Configuration: { mount?: string[] } = {}): void => {
	const Wanted = (Configuration.mount ?? []).filter(
		(Specifier): Specifier is string => typeof Specifier === "string" && Specifier !== "",
	);
	if (Wanted.length === 0) {
		return;
	}
	// Detach: hand the rail back to the loader NOW, mount on the next turn.
	setImmediate(() => {
		for (const Specifier of Wanted) {
			if (Mounted.has(Specifier)) {
				continue;
			}
			Mounted.add(Specifier);
			void Mount(Context, Specifier);
		}
	});
};

export default { name, apply, Config };
