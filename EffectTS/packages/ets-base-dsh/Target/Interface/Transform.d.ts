import type Output from "@Interface/Output.js";
export default interface Transform {
    (current: string | null, section: unknown, keep: string[]): Output | null;
}
