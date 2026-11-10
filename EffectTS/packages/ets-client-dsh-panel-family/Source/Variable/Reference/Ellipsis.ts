import type { PanelSection } from "@Interface/Panel.js";
import Trace from "@Variable/Trace.js";

/**
 * @module Ellipsis
 *
 * The adapter for hook-dsh-normalize-ellipsis, the second of the five
 * remaining normalize flavors (order 12).
 *
 * @remarks
 *
 * Same reference pattern: the child slot, the settings namespace, the static
 * activation posture, and the D5 trace names. The ellipsis schema adds the
 * volatile `replacement` knob (the transform's only tunable) on top of the
 * family's shared shape.
 */
export default {
	id: "adapter-hook-dsh-normalize-ellipsis",
	bundle: "@playform/ets-hook-dsh-normalize-ellipsis",
	namespace: "hook-dsh-normalize-ellipsis",
	title: "normalize-ellipsis",
	order: 12,
	slot: "playform.panel.section",
	activation: "enabled",
	traceKinds: Trace.kinds,
} satisfies PanelSection;
