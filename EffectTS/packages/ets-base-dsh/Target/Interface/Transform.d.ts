import type Output from "./Output.js";
export default interface Transform {
    (current: string | null, section: unknown, keep: string[]): Output | null;
}
