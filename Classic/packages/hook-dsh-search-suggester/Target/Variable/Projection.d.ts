/** The projection key: one host-only cell per session. */
export declare const ProjectionKey = "searchHistory";
/** The touch cap: the oldest touch is shifted out past this many. */
export declare const ProjectionCap = 512;
/** The persisted-state version: bump when the state fields or the fold change. */
export declare const ProjectionVersion = 1;
