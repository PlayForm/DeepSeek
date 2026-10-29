// Client - the panel package's client half body (Source/Client.ts delegates
// its apply here). The v4.1 wiring, zero adapter logic of its own:
//
//   1. Provide the slot-aware registry service:
//      ctx.reflect.provide("playformFamilyPanel", the Registry).
//   2. Register the locale dictionaries and create the live trace tail (the
//      D5 bus when the host exposes it; the static fallback otherwise).
//   3. Mount the two PANELS, each DECLARING ITS CHILD SLOT in the
//      registration's children table (the v4.1 model):
//        - conversation.view -> playform-family (id, order Config.tabOrder,
//          session scope) declares playform.panel.section (list, session);
//        - shell.overlay -> playform-family-overlay declares
//          playform.panel.overlay (list, root).
//      The components render their declared child slots through the
//      renderSlot prop; the registry only supplies the data (the occupancy
//      count for the empty state, the adapter manifests).
//   4. Register the thirteen shipped adapters (Function/Reference.ts) - the
//      three references plus the ten that copied their pattern.
//
// The locale strings come through the client locale service (R-UI-1 A6):
// every visible string routes through ctx.locale (namespace
// "client-dsh-panel-family", the dictionaries in Variable/Locale-*.json).
// React arrives via createElement calls (no JSX in this package) and stays
// an external - the module system's platform seed table resolves it.
import Bridge from "@Function/Bridge.js";
import Forms from "@Function/Forms.js";
import Live from "@Function/Live.js";
import Reference from "@Function/Reference.js";
import Registry from "@Function/Registry.js";
import Trace from "@Function/Trace.js";
import type { ClientContext } from "@Interface/Client.js";
import type { PanelRegistry } from "@Interface/Panel.js";
import type { PanelPorts } from "@Interface/Ports.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import ZH_DICTIONARY from "@Variable/Locale-zh.json";
import Slots from "@Variable/Slots.js";
import Names from "@Variable/Trace.js";
import { createElement, useEffect, useState, type ReactNode } from "react";

const NAMESPACE = "client-dsh-panel-family";

/** The renderer's child-slot dispatch prop (PropsRenderSlots). */
type RenderSlot = (name: string, props: object) => ReactNode;

/** The family tab body: the empty state + the declared section child slot. */
function FamilyTab(props: {
	registry: PanelRegistry;
	renderSlot?: RenderSlot;
}): ReturnType<typeof createElement> {
	const [, SetVersion] = useState(props.registry.getVersion());
	useEffect(() => props.registry.subscribe(() => SetVersion(props.registry.getVersion())), []);
	const Sections = props.registry.entries(Slots.section);
	return createElement(
		"div",
		{ className: "playform-family-tab" },
		Sections.length === 0 ? createElement("p", {}, EN_DICTIONARY.empty) : undefined,
		props.renderSlot === undefined ? undefined : props.renderSlot(Slots.section, {}),
	);
}

export default function Client(ctx: ClientContext): void {
	// The defaults: the tab order mirrors the Config schema's tabOrder
	// default (20). The client half cannot read the Loader row's config
	// object directly; the end-phase wires the shared config channel
	// (DECISIONS in the PoC report).
	const config = { tabOrder: 20, overlayMaxWidth: 720 };
	const registry = Registry((line) => ctx.logger.warn(line));
	// The live status source: the D5 trace when the host exposes it.
	const live = Live(Trace(ctx), Names.kinds);
	const configForms = Forms(ctx);
	const bridge = Bridge(ctx);
	const ports: PanelPorts = {
		registry,
		live,
		open: (target) => registry.open(target),
		log: {
			info: (message) => ctx.logger.info(message),
			warn: (message) => ctx.logger.warn(message),
		},
		...(configForms === undefined ? {} : { configForms }),
		...(bridge === undefined ? {} : { bridge }),
	};
	// The registry service: removed with the plugin (the provide disposer).
	ctx.reflect.provide("playformFamilyPanel", registry);
	// The locale dictionaries: registered inside ctx.effect so an unload
	// removes them (the ui-trajectory precedent).
	ctx.effect(
		() => ctx.locale.register(NAMESPACE, { en: EN_DICTIONARY, zh: ZH_DICTIONARY }),
		"panel: dictionaries",
	);
	// The live trace tail: its subscriptions drop with the plugin.
	ctx.effect(() => () => live.dispose(), "panel: trace source");
	// The family tab: registered inside ctx.effect; the registration declares
	// the section child slot (the v4.1 model) and renders it through
	// renderSlot. The slot service's effect wrapper removes it with the plugin.
	ctx.effect(
		() =>
			ctx.slots.inject(Slots.tab, () =>
				ctx.slots.register(
					{
						name: Slots.tab,
						id: "playform-family",
						order: config.tabOrder,
						locale: NAMESPACE,
						label: () => EN_DICTIONARY.tab,
						children: { [Slots.section]: { kind: "list", scope: "session" } },
					},
					(props: Record<string, unknown> = {}) =>
						createElement(FamilyTab, {
							registry,
							...(typeof props["renderSlot"] === "function"
								? { renderSlot: props["renderSlot"] as RenderSlot }
								: {}),
						}),
				),
			),
		"panel: family tab",
	);
	// The overlay mount: the second panel, declaring its own child slot. It
	// renders the overlay child slot through renderSlot; the styled container
	// stays the registration's component so the shell mounts one element.
	ctx.effect(
		() =>
			ctx.slots.inject(Slots.shell, () =>
				ctx.slots.register(
					{
						name: Slots.shell,
						id: "playform-family-overlay",
						locale: NAMESPACE,
						label: () => EN_DICTIONARY.overlay,
						children: { [Slots.overlay]: { kind: "list", scope: "root" } },
					},
					(props: Record<string, unknown> = {}) =>
						createElement(
							"div",
							{
								className: "playform-family-overlay",
								style: { maxWidth: config.overlayMaxWidth },
							},
							typeof props["renderSlot"] === "function"
								? (props["renderSlot"] as RenderSlot)(Slots.overlay, {})
								: undefined,
						),
				),
			),
		"panel: overlay mount",
	);
	// The thirteen shipped adapters (three references + ten copies).
	Reference(ctx, ports);
}
