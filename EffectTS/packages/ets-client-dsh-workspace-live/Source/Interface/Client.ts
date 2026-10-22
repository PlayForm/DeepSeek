// Client - the minimal client-half Context augmentation (Interface/Client):
// the harness client SDK types (ctx.locale, ctx.slots, ctx.effect,
// ctx.provide) are not a resolvable dependency of this package, so the
// package declares its own vocabulary - the same declare-module pattern the
// family uses for ctx.pluginFactory. The signatures mirror the usage in
// Function/Client.ts and the harness's decoration template
// (ctx.slots.inject -> ctx.slots.register, the dictionaries routed through
// ctx.locale.register).
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin effect: run `start`, keep its disposer, reverse on unload. */
		effect(start: () => void | (() => void), label?: string): void;
		/** Registers a service owned by the plugin (removed with the plugin). */
		provide(name: string, value: unknown): void;
		/** The client locale service: registers one namespace's dictionaries. */
		locale: {
			register(namespace: string, dictionaries: Record<string, unknown>): void;
		};
		/** The client slot service: mounts components into named slots. */
		slots: {
			/** Register a factory for one slot point; the factory runs when the
			 *  slot opens and returns the registration. */
			inject(slot: string, factory: () => unknown): void;
			/** Register one component into the slot (returns the disposer). */
			register(
				options: {
					name: string;
					id: string;
					order?: number;
					locale?: string;
					label?: () => string;
				},
				component: (props: unknown) => unknown,
			): unknown;
		};
	}
}
