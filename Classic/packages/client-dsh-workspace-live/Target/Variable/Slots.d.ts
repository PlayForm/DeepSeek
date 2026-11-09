declare const _default: {
    /** The host slot the workspace tab mounts into. */
    readonly tab: "conversation.view";
    /** The host slot the right-Sidebar tab body mounts into (keyed by the tab
     *  type's id; declared by ui-sidebar-right). */
    readonly pane: "sidebar.right.pane.tab";
    /** The child slot the workspace tab declares and renders. */
    readonly section: "workspace.live.section";
};
export default _default;
