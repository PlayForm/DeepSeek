import type { Context } from "@deepseek-ai/cordis";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Attach
 *
 * The lifecycle effects every module needs (`Function/Attach` in the service
 * API). Registered once per load from the ROOT context, inside `ctx.effect`
 * so they unwind on unload (fiber/HMR/config hot-reload):
 *
 * - P1 - the jobs controller: the JobRegistry is probed via
 *   `ctx.get("jobs")`; `attachController(name)` called from THIS unscoped
 *   context serves every owner (registrations made from an unscoped/root
 *   context are owner-relative - jobs.md), which is exactly what makes a
 *   root-level update stage registerable as a harness job despite ctx.jobs
 *   being agent-scoped for session compositions. Probed, best effort: a
 *   deployment without the JobRegistry simply has no controller.
 * - P2 - in-flight disposal: on unload, abort every detached continuation
 *   still in flight and clear the map (defensive-patterns quiescence).
 * - P5 - the optional storage seam: the facility is probed via
 *   `ctx.get("storageDomain")`; when present `Function/Open` declares and
 *   opens the State's journalDomain (the setup option, default
 *   `package_governance`; never awaited - best-effort inside) and the
 *   disposer closes it; absent or unusable is a silent skip - the journal
 *   sink is retired to a no-op so the queue cannot grow. The service
 *   instance is probed too (`ctx.get "pluginFactory"` - the same injected
 *   instance every module holds): the FIRST successful open binds the
 *   SHARED journal put on it, so the single-open domain's records from
 *   every module land in the one shared table (`Function/Open` +
 *   `Function/Journal` - the live single-open-domain finding).
 *
 * The module handle is `{ state, name }`: the built State, and the
 * controller/effect label stem (the module name -
 * "hook-dsh-governor-package" - reproduces the trio's effect labels
 * byte-identically).
 */
declare function _default(Context: Context, Module: {
    state: State;
    name: string;
}): void;
