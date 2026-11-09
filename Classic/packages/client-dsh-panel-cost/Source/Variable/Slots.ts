// Slots - the slot points this plugin mounts into, as one constant table:
// the family pattern keeps the slot names in one place so the client
// registration and the tests never drift apart. The Cost tab shares the
// conversation.view slot with the rest of the panel family.
export default { tab: "conversation.view" } as const;
