// Slots - the live view's slot vocabulary. `tab` is the host slot the
// workspace tab mounts into; `section` is the CHILD slot the tab declares
// (the panel family's v4.1 model: a registration's `children` table declares
// the child slots it owns, and the component renders them through the
// renderer's `renderSlot` prop). The workspace-live section registers into
// the child slot with its data carried by the registration's `inject` face.
export default {
	/** The host slot the workspace tab mounts into. */
	tab: "conversation.view",
	/** The child slot the workspace tab declares and renders. */
	section: "workspace.live.section",
} as const;
