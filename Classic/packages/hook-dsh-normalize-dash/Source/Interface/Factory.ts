// Factory — the STRUCTURAL VIEW of the injected @playform/dsh-plugin-factory
// service (the family's class/service plugin, factory SCHEME.md §0–§2). The
// dash normalizer is the factory's SECOND consumer and the first NON-MANIFEST module:
// it consumes the State builder (cell unwrap + shared fields, §2.10), the
// ledger (Append, §2.1) and the probe-once Seam accessor (§2.15) — but NOT
// the fs/observed Wire (§2.11, fs/observed-hardwired to this family's
// silence): the normalize-dash implements its OWN `ctx.on("llm/stream", …)`
// registration, the same plain fiber-owned pattern.
//
// The type arrives TYPE-ONLY from the factory package (erased at build — the
// built Target has NO runtime import of the factory: at runtime the service
// resolves from the profile through the injector, never through a module
// import). The augmentation below publishes the typed vocabulary on the
// cordis Context (plugin-development skill, item 12), so `ctx.pluginFactory`
// is fully typed at every consumption site. The `llm/stream` EVENT itself is
// NOT re-declared here: @deepseek-ai/dsh-llm already augments `Events` with
// `'llm/stream'` (options: GenerateOptions, next) => AsyncIterable<StreamChunk>
// — re-declaring it would be a conflicting duplicate.
import type Factory from "@playform/dsh-plugin-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/dsh-plugin-factory). */
		pluginFactory: Factory;
	}
}
