// Slots - the runtime slot vocabulary: the two CHILD SLOTS the panel declares
// and renders (the v4.1 model), plus the two host slots the panel mounts
// into. The type side lives in Interface/Panel.ts (PanelSlot); the
// `satisfies` annotations make a typo a compile error while keeping the
// literal types for the byte-exact smoke assertions.
import type { PanelSlot } from "@Interface/Panel.js";

export default {
	/** The family tab's section list (conversation.view > playform-family). */
	section: "playform.panel.section" satisfies PanelSlot,
	/** The overlay panel's section list (shell.overlay > playform-family-overlay). */
	overlay: "playform.panel.overlay" satisfies PanelSlot,
	/** The host slot the family tab mounts into. */
	tab: "conversation.view",
	/** The host slot the overlay panel mounts into. */
	shell: "shell.overlay",
} as const;
