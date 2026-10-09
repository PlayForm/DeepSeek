// Attach — the lifecycle effects every module needs (Function/Attach in the
// service API). Registered once per load from the ROOT context, inside
// `ctx.effect` so they unwind on unload (fiber/HMR/config hot-reload):
//
//   P1 — the jobs controller: the JobRegistry is probed via ctx.get("jobs");
//        `attachController(name)` called from THIS unscoped context serves
//        every owner (registrations made from an unscoped/root context are
//        owner-relative — jobs.md), which is exactly what makes a root-level
//        update stage registerable as a harness job despite ctx.jobs being
//        agent-scoped for session compositions. Probed, best effort: a
//        deployment without the JobRegistry simply has no controller.
//   P2 — in-flight disposal: on unload, abort every detached continuation
//        still in flight and clear the map (defensive-patterns quiescence).
//   P5 — the optional storage seam: the facility is probed via
//        ctx.get("storageDomain"); when present Function/Open declares and
//        opens the package_governance domain (never awaited — best-effort
//        inside) and the disposer closes it; absent or unusable is a silent
//        skip — the journal sink is retired to a no-op so the queue cannot
//        grow. The service instance is probed too (ctx.get
//        "pluginFactory" — the same injected instance every module holds):
//        the FIRST successful open binds the SHARED journal put on it, so
//        the single-open domain's records from every module land in the one
//        shared table (Function/Open + Function/Journal — the live
//        single-open-domain finding).
//
// The module handle is `{ state, name }`: the built State, and the
// controller/effect label stem (the module name — "hook-dsh-governor-package" —
// reproduces the trio's effect labels byte-identically).
import Open from "./Open.js";
import type { State as State } from "@playform/ets-dsh-hook";
import type { Jobs as JobsRegistry } from "@playform/ets-dsh-hook";
import type { Context } from "@deepseek-ai/cordis";

export default (Context: Context, Module: { state: State; name: string }): void => {
	// P1 — the jobs controller (see header).
	Context.effect?.(() => {
		const Detach = (Context.get?.("jobs") as JobsRegistry | undefined)?.attachController?.(
			Module.name,
		);
		return () => {
			try {
				Detach?.();
			} catch {
				/* detach best-effort */
			}
		};
	}, `${Module.name}-jobs`);
	// P2 — in-flight disposal: abort every update continuation that is still
	// in flight (a spawned child is killed via its signal; a library run that
	// is not signal-aware settles on its own).
	Context.effect?.(
		() => () => {
			for (const { controller } of Module.state.Inflight.values()) {
				try {
					controller.abort();
				} catch {
					/* already gone */
				}
			}
			Module.state.Inflight.clear();
		},
		`${Module.name}-inflight`,
	);
	// P5 — the optional storage seam (see header).
	Context.effect?.(() => {
		const Facility = Context.get?.("storageDomain") as Parameters<typeof Open>[1] | undefined;
		// The service instance for the SHARED sink (probed, best-effort — a
		// throwing accessor must never take the effect down).
		let Factory: Parameters<typeof Open>[2] | undefined;
		try {
			Factory = Context.get?.("pluginFactory") as Parameters<typeof Open>[2] | undefined;
		} catch {
			/* keep undefined — the shared sink just stays unbound */
		}
		switch (true) {
			case !!Facility: {
				void Open(Module.state, Facility, Factory); // never awaited — best-effort inside
				return () => {
					const Domain = Module.state.Domain;
					switch (true) {
						case !!Domain:
							void Domain.close().catch(() => {
								/* close best-effort */
							});
							break;
					}
				};
			}
			default:
				// Silent skip: nothing to open, nothing to close — and no queue
				// growth either (the sink is retired AND the pre-open queue is
				// dropped — records queued before the probe (e.g. the activation
				// record) have nowhere to go; the human ledger remains the source).
				Module.state.Queue.length = 0;
				Module.state.Journal = () => {};
				return () => {};
		}
	}, `${Module.name}-storage`);
};
