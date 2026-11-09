/**
 * @module Slots
 *
 * The live view's slot vocabulary.
 *
 * @remarks
 * `tab` is the host slot the workspace tab mounts into; `pane` is the host
 * slot the live view mounts into as a right-Sidebar tab body (a keyed seat
 * declared by ui-sidebar-right, keyed by the tab type's own id); `section`
 * is the CHILD slot the tab declares (the panel family's v4.1 model: a
 * registration's `children` table declares the child slots it owns, and the
 * component renders them through the renderer's `renderSlot` prop). The
 * workspace-live section registers into the child slot with its data carried
 * by the registration's `inject` face.
 */
declare const _default: {
    /**
     * The host slot the workspace tab mounts into.
     */
    readonly tab: "conversation.view";
    /**
     * The host slot the right-Sidebar tab body mounts into (keyed by the tab
     * type's id; declared by ui-sidebar-right).
     */
    readonly pane: "sidebar.right.pane.tab";
    /**
     * The child slot the workspace tab declares and renders.
     */
    readonly section: "workspace.live.section";
};
export default _default;
