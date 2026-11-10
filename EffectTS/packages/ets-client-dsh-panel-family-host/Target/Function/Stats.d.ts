/**
 * @module Stats
 *
 * The stats() method: the ccr store summary.
 *
 * @remarks
 *
 * The LRU internals are not exposed by any existing remote, so v1 returns the
 * ccr log summary (path, byte size, line count) from the Config ccrLog file.
 * Read-only.
 */
/**
 * The ccr log summary or the not-found failure.
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
