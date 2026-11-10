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
