export default interface Host {
    /** tail(namespace, lines): the last `lines` lines of the owning
     *  module's ~/.dsh log (`~/.dsh/<namespace>.log`). The namespace is
     *  validated against the family module-name pattern (lowercase
     *  letters/digits/hyphens) - a path traversal attempt is rejected, not
     *  sanitized. `lines` is capped at the Config maxLines. Returns the
     *  lines (oldest first, each without its newline) or a failure:
     *  `not-found` when the log file does not exist, `rejected` when the
     *  namespace or the line count is invalid. */
    tail(namespace: string, lines: number): Promise<unknown>;
    /** stats(): the CCR store summary. The LRU internals are not exposed by
     *  any existing remote (the ccr adapter's LRU count stays deferred to
     *  the Typert spike), so v1 returns the ccr log summary (the log path,
     *  its byte size, its line count) from the Config ccrLog file. */
    stats(): Promise<unknown>;
}
