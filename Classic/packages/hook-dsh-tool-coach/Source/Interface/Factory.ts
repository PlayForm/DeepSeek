// Factory - the STRUCTURAL VIEW of the injected @playform/plugin-dsh-factory
// service (the family's class/service plugin, factory SCHEME.md §0-§2). The
// coach is the factory's NON-MANIFEST consumer: it uses the State builder
// (cell unwrap + shared fields + the P10 volatile refresh, §2.10) and the
// ledger (Append, §2.1) - but NOT the fs/observed Wire (§2.11,
// fs/observed-hardwired to this family's silence): the coach implements its
// OWN plain `ctx.on(...)` registrations, the same fiber-owned pattern (with
// the waterfall's `next()`-first discipline and the fail-open envelope).
//
// The type arrives TYPE-ONLY from the factory package (erased at build - the
// built Target has NO runtime import of the factory: at runtime the service
// resolves from the profile through the injector, never through a module
// import). The augmentation below publishes the typed vocabulary on the
// cordis Context (plugin-development skill, item 12), so `ctx.pluginFactory`
// is fully typed at every consumption site. The tool events themselves are
// NOT re-declared here: @deepseek-ai/dsh-tools already augments `Events` with
// the tools/* waterfalls - re-declaring them would be a conflicting duplicate.
import type Factory from "@playform/plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
