import type Config from "./Config.js";
export default interface State extends Config {
    /** The master switch, unwrapped from its cell. */
    On: boolean;
    /** The per-session review cap, unwrapped. */
    Cap: number;
    /** The factory service (the ledger sink). */
    Factory: any;
    /** Reviews already triggered, per agent. */
    Reviews: Map<unknown, number>;
    /** The activation proof has been written (the one-shot warn guard). */
    Warned: boolean;
}
