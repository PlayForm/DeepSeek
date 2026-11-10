export default _default;
/**
 * @module Stage
 *
 * The semantic pipeline's stage classifier: the stage of one file touch, derived
 * from the tool kind and the file's own prior touch kinds in the session.
 *
 * @remarks
 * The classification follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section
 * 16.1. A file does not "get touched"; it moves through stages, and each stage
 * has a different cost shape. The order is exact: a search locates, a restored
 * edit reverts, a read after an edit verifies, a read after a read rereads, a
 * first read reads, every mutating touch edits - and anything the classifier
 * cannot place is a discovery, never a guess. The restoration flag is evidence,
 * not a heuristic (B6b): the drain passes true only when the file's after
 * content hash resolves to a FileVersion row recorded earlier than the touch
 * and different from the version the file held just now, and false when no such
 * row exists.
 */
declare function _default(Prior: readonly string[], Kind: string, Restored: boolean): string;
