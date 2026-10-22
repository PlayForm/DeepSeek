// Client - the panel package's client half body (Source/Client.ts delegates
// its apply here). Two responsibilities, zero adapter logic:
//
//   1. Provide the registry service: ctx.reflect.provide("playformFamilyPanel",
//      the Registry) - the disposer removes the service with the plugin.
//   2. Mount the two slot points, all inside ctx.effect so everything unwinds
//      with the plugin (PHASE-2 section 1):
//        - "conversation.view" -> the family tab (id "playform-family",
//          order = Config.tabOrder, session scope), rendering every
//          registered section with mount "family-tab" ordered by (order, id).
//        - "shell.overlay" -> the overlay mount for mount:"overlay" sections,
//          opened via registry.open().
//
// The locale strings come through the client locale service (R-UI-1 A6):
// every visible string routes through ctx.locale (namespace
// "client-dsh-panel-family", the dictionaries in Variable/Locale-*.json).
// React arrives via createElement calls (no JSX in this package) and stays
// an external - the module system's platform seed table resolves it.
import type { Context } from "@deepseek-ai/cordis";
import ClientApply from "@Function/Registry.js";
import type { PanelRegistry, PanelSection } from "@Interface/Panel.js";
import EN_DICTIONARY from "@Variable/Locale-en.json";
import ZH_DICTIONARY from "@Variable/Locale-zh.json";
import { createElement, useEffect, useState } from "react";

const NAMESPACE = "client-dsh-panel-family";

/** The family tab body: renders the registered family-tab sections. */
function FamilyTab(props: { registry: PanelRegistry }): ReturnType<typeof createElement> {
	const [, setVersion] = useState(props.registry.getVersion());
	useEffect(() => props.registry.subscribe(() => setVersion(props.registry.getVersion())), []);
	const sections = props.registry.entries().filter((section) => section.mount === "family-tab");
	return createElement(
		"div",
		{ className: "playform-family-tab" },
		sections.map((section: PanelSection) =>
			createElement(
				"section",
				{ key: section.id, className: "playform-family-section" },
				createElement("h3", {}, section.title),
				section.render({ open: props.registry.open }),
			),
		),
		sections.length === 0 ? createElement("p", {}, EN_DICTIONARY.empty) : undefined,
	);
}

export default function Client(ctx: Context): void {
	const registry = ClientApply();
	// The defaults: the tab order mirrors the Config schema's tabOrder
	// default (20). The client half cannot read the Loader row's config
	// object directly; the end-phase wires the shared config channel
	// (DECISIONS in the PoC report).
	const config = { tabOrder: 20, overlayMaxWidth: 720 };
	// The registry service: removed with the plugin (the provide disposer).
	ctx.reflect.provide("playformFamilyPanel", registry);
	// The locale dictionaries: registered inside ctx.effect so an unload
	// removes them (the ui-trajectory precedent).
	ctx.effect(
		() => ctx.locale.register(NAMESPACE, { en: EN_DICTIONARY, zh: ZH_DICTIONARY }),
		"panel: dictionaries",
	);
	// The family tab: registered inside ctx.effect; the slot service's
	// effect wrapper removes it with the plugin.
	ctx.effect(
		() =>
			ctx.slots.inject("conversation.view", () =>
				ctx.slots.register(
					{
						name: "conversation.view",
						id: "playform-family",
						order: config.tabOrder,
						locale: NAMESPACE,
						label: () => EN_DICTIONARY.tab,
					},
					// eslint-disable-next-line react/display-name
					() => createElement(FamilyTab, { registry }),
				),
			),
		"panel: family tab",
	);
	// The overlay mount: renders overlay sections for views opened through
	// registry.open(). The registry's AttachOpen wires the shell's overlay
	// host when one is present; without it open() only records the request.
	ctx.effect(
		() =>
			ctx.slots.inject("shell.overlay", () =>
				ctx.slots.register(
					{
						name: "shell.overlay",
						id: "playform-family-overlay",
						locale: NAMESPACE,
						label: () => EN_DICTIONARY.overlay,
					},
					() =>
						createElement(
							"div",
							{
								className: "playform-family-overlay",
								style: { maxWidth: config.overlayMaxWidth },
							},
							registry
								.entries()
								.filter((section) => section.mount === "overlay")
								.map((section) =>
									createElement(
										"section",
										{ key: section.id },
										createElement("h3", {}, section.title),
										section.render({ open: registry.open }),
									),
								),
						),
				),
			),
		"panel: overlay mount",
	);
}
