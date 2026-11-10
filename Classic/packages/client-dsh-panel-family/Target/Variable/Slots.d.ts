/**
 * @module Slots
 *
 * The runtime slot vocabulary: the two child slots the panel declares and renders (the v4.1
 * model), plus the two host slots the panel mounts into.
 *
 * @remarks
 *
 * The type side lives in `Interface/Panel.ts` (`PanelSlot`); the `satisfies` annotations make a
 * typo a compile error while keeping the literal types for the byte-exact smoke assertions.
 */
declare const _default: {
    /**
     * The family tab's section list (conversation.view > playform-family).
     */
    readonly section: "playform.panel.section";
    /**
     * The overlay panel's section list (shell.overlay > playform-family-overlay).
     */
    readonly overlay: "playform.panel.overlay";
    /**
     * The host slot the family tab mounts into.
     */
    readonly tab: "conversation.view";
    /**
     * The host slot the overlay panel mounts into.
     */
    readonly shell: "shell.overlay";
};
export default _default;
