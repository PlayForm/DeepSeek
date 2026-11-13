import type { State as Shared } from "@playform/plugin-dsh-factory";
/**
 * @module State
 *
 * The per-apply plugin state: the FACTORY's shared shape extended with the
 * pinner's own field.
 *
 * @remarks
 *
 * Since the factory refactor the State is the factory's shared shape (the
 * shape Function/State of @playform/plugin-dsh-factory builds, consumed by
 * every factory primitive) extended with the pinner's own fields:
 *
 * - On - the MASTER SWITCH (config `enabled`, copied by the State builder's
 *   `fields` map; the mount-time switch: a disabled pinner appends
 *   `disabled (enabled=false)` INSTEAD of the activation proof and still
 *   registers everything - every surface reads it at call time, the volatile
 *   live-flip law);
 * - Section - the dependency sections the pinner may rewrite (config
 *   `sections`, copied by the State builder's `fields` map).
 *
 * The shared shape comes from the factory's NAMED type export (`State` - the
 * v0.1.1 declaration fix: the built Target/Library.d.ts ships RELATIVE
 * specifiers, so the extracted shared shape is the real one; the pre-fix
 * `Parameters<Factory["Append"]>[0]` derivation - which every factory
 * primitive takes the same state from - resolved through the aliased
 * declaration to THIS file and circled; the named export is the restored,
 * leak-proof extraction), so there is no duplicated interface to keep in sync:
 * the pinner's State IS assignable to every factory parameter by construction.
 * The instance itself is built by `Furnace.State(ctx, config, { module:
 * "hook-dsh-pinner-package", fields: { Section: "sections" }, policyFileName:
 * "pin-policy.json" })` (Function/Apply) - never returned from `apply` (the
 * loader treats apply return values specially, a live-verified lesson);
 * Function/Apply exposes it via a context attachment for test probes.
 *
 * The factory's collections (identical semantics to the pre-refactor pinner):
 *
 * - Stash - targetKey to the version token the pinner last processed
 *   (idempotence gate for the module's own re-emits within the async window);
 * - Inflight - targetKey to the abort controller of the detached pass,
 *   aborted and cleared by the Attach effect on unload (P2);
 * - Seams - the probe-once cache of optional services;
 * - Queue - the pre-open journal queue (P5), drained when the optional storage
 *   domain opens.
 *
 * The opaque identity types come from @deepseek-ai/dsh-fs via the factory's
 * contract: `FsTargetKey` and `FsVersion` are branded strings the backend owns
 * - the pinner stores and compares them but never parses or computes them
 * (subsystems/filesystem.md).
 */
export default interface State extends Shared {
    /**
     * The MASTER SWITCH (config `enabled`; the setup map's `On <- enabled`).
     */
    On: boolean;
    /**
     * Dependency sections the pinner may rewrite (config `sections`).
     */
    Section: string[];
}
