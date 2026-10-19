// Factory - the STRUCTURAL VIEW of the injected @playform/ets-plugin-dsh-factory
// service (the family's class/service plugin, factory SCHEME.md §0-§2). The
// CCR hook is the factory's NON-MANIFEST consumer: it uses the State builder
// (cell unwrap + shared fields, §2.10) and the ledger (Append, §2.1) - but
// NOT the fs/observed Wire (§2.11, fs/observed-hardwired to this family's
// silence): the CCR hook implements its OWN `ctx.on("tools/post-execute",
// ...)` registration, the same plain fiber-owned pattern (with the
// waterfall's `next()`-first discipline and the spill-policy's
// fail-open/posture details).
//
// The type arrives TYPE-ONLY from the factory package (erased at build - the
// built Target has NO runtime import of the factory: at runtime the service
// resolves from the profile through the injector, never through a module
// import). The augmentation below publishes the typed vocabulary on the
// cordis Context (plugin-development skill, item 12), so `ctx.pluginFactory`
// is fully typed at every consumption site. The `tools/post-execute` EVENT
// itself is NOT re-declared here: @deepseek-ai/dsh-tools already augments
// `Events` with `'tools/post-execute'` (exec, result, next) => Promise
// <PostToolDecision> - re-declaring it would be a conflicting duplicate.
import type Factory from "@playform/ets-plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
