export default _default;
/**
 * @module Stage
 *
 * The semantic pipeline's stage classifier (Documentation/Plans/
 * COST-TRACK-PLUGIN.md section 16.1): a file does not "get touched"; it
 * moves through stages, and each stage has a different cost shape.
 *
 * @remarks
 * The stage is derived from the tool kind and the file's own prior touch
 * kinds in the session, in this exact order: a search locates, a restored
 * edit reverts, a read after an edit verifies, a read after a read rereads,
 * a first read reads, every mutating touch edits - and anything the
 * classifier cannot place is a discovery, never a guess.
 */
declare function _default(Prior: readonly string[], Kind: string, Restored: boolean): string;
