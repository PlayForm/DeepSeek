/**
 * @module Stats
 *
 * The `stats()` method: the ccr store summary from the Config ccrLog file.
 *
 * @remarks
 *
 * The LRU internals are not exposed by any existing remote, so v1 returns the
 * ccr log summary (path, byte size, line count). Read-only.
 */
export type StatsResult = {
    ok: true;
    ccrLog: string;
    bytes: number;
    lines: number;
} | {
    ok: false;
    code: "not-found";
    message: string;
};
export default function Stats(ccrLog: string): Promise<StatsResult>;
