import type UsageRecord from "./Record.js";
export interface Corpus {
    /** The absolute `SKILL.md` path the catalog resolves for this name, or null. */
    resolve(name: string): string | null;
    /** The current body, or null when the catalog does not resolve the name. */
    body(name: string): string | null;
    /** The body the confirm prompt carried, or null when it carried none. */
    carried(name: string): string | null;
    /** The support file's current text, or null when it is absent or unreadable. */
    support(name: string, filePath: string): string | null;
    /** The usage record, or null when the store holds none. */
    record(name: string): UsageRecord | null;
    /** Canonical containment, for the root fence and the archive refusal. */
    contains(parent: string, child: string): boolean;
}
