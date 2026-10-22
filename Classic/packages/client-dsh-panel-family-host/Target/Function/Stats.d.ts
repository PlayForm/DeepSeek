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
