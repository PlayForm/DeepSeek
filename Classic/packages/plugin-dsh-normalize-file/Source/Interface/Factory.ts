// Factory - the STRUCTURAL VIEW of the injected @playform/plugin-dsh-factory
// service (the family's class/service plugin, factory SCHEME.md §0-§2). The
// file-content normalizer is a NON-MANIFEST factory consumer: it consumes the
// State builder (cell unwrap + shared fields, §2.10), the ledger (Append,
// §2.1), the P5 journal (Journal) and - uniquely in the normalize family - the
// ONE shared write executor (Write, §2.7, the raw-write tool's own pipeline):
// resolve stays caller-side, everything after the resolve (the fs/write-intent
// waterfall, the standing sandbox policy, writeText, the root-context
// fs/observed present emit) is the shared executor's. It consumes NO Wire at
// all (§2.11 is fs/observed-hardwired to the family's silence; §2.11's
// counterpart, a stream listener, is not factory machinery): the
// file-content normalizer registers NO event listener - the family's first
// listener-less flavor - its trigger is an explicit agent tool call, not an
// event stream.
//
// The type arrives TYPE-ONLY from the factory package (erased at build - the
// built Target has NO runtime import of the factory: at runtime the service
// resolves from the profile through the injector, never through a module
// import). The augmentation below publishes the typed vocabulary on the
// cordis Context (plugin-development skill, item 12), so `ctx.pluginFactory`
// is fully typed at every consumption site. No EVENT is re-declared here: the
// plugin registers no listener, and the fs vocabulary (fs/write-intent,
// fs/observed) that the shared executor dispatches arrives through the
// factory's own declarations, which import @deepseek-ai/dsh-fs - importing
// this module's types pulls the augmentation chain in.
import type Factory from "@playform/plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
