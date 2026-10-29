// Adapter - the adapter contract's wiring half: one call registers a host
// bundle's adapter in BOTH directions of the v4.1 contribution model.
//   1. the DATA path: the manifest goes into the slot-aware registry
//      (playformFamilyPanel), which enforces one adapter per bundle per slot;
//   2. the REACT path: the client half injects the child slot the manifest
//      declares and registers one section component there, with the
//      registration's inject face carrying `{ section, ports }` to the
//      component (React crosses through slots; data crosses through the
//      inject face).
// Both registrations ride ctx.effect, so plugin unload removes the section
// and its manifest with no residue. This is the template every per-bundle
// adapter copies into its own client half.
import Section from "@Function/Section.js";
import type { ClientContext } from "@Interface/Client.js";
import type { PanelSection } from "@Interface/Panel.js";
import type { PanelPorts } from "@Interface/Ports.js";
import Slots from "@Variable/Slots.js";
import { createElement } from "react";

const NAMESPACE = "client-dsh-panel-family";

/** The registered component: the slot's inject face + standard props. */
const Component = (props: Record<string, unknown> = {}): unknown =>
	createElement(Section, props as unknown as Parameters<typeof Section>[0]);

export default function Adapter(
	ctx: ClientContext,
	Ports: PanelPorts,
	SectionDefinition: PanelSection,
): void {
	const Slot = SectionDefinition.slot ?? Slots.section;
	ctx.effect(() => {
		const OffRegistry = Ports.registry.register(SectionDefinition);
		const OffSlot = ctx.slots.inject(Slot, () =>
			ctx.slots.register(
				{
					name: Slot,
					id: SectionDefinition.id,
					order: SectionDefinition.order,
					locale: NAMESPACE,
					inject: () => ({ section: SectionDefinition, ports: Ports }),
				},
				Component,
			),
		);
		return () => {
			OffSlot();
			OffRegistry();
		};
	}, `panel: adapter ${SectionDefinition.id}`);
}
