/**
 * @module Slots
 *
 * The slot points this plugin mounts into, as one constant table.
 *
 * @remarks
 *
 * The family pattern keeps the slot names in one place so the client registration and the tests
 * never drift apart. The Cost tab shares the conversation.view slot with the rest of the panel
 * family.
 */
declare const _default: {
    readonly tab: "conversation.view";
};
export default _default;
