import type Member from "./Member.js";
export default interface Snapshot {
    /** The batch key (multi-batch support). */
    batch: string;
    /** Snapshot generation time (epoch ms). */
    generatedAt: number;
    /** The members currently active, queue order first. */
    running: Member[];
    /** The idle members, in queue order. */
    idle: Member[];
    /** The recent completions, newest first, bounded by maxRecent. */
    recent: {
        id: string;
        status: string;
        task: string;
        at: number;
    }[];
}
