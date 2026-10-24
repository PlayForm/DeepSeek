import type Pack from "./Pack.js";
export default interface Located {
    /** The workspace root (the first ancestor whose pack signature matched). */
    root: string;
    /** The resolved pack for that root (the built-in pack when no file exists). */
    pack: Pack;
}
