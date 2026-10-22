export interface Signal {
    /** The rule name, for the ledger and the smokes. */
    rule: string;
    /** The regex source, tested against the call probe (tool name + arguments JSON). */
    pattern: string;
    /** The weight added to the intent's score when the signal matches. */
    weight: number;
    /** Optional tool-name restriction: empty/undefined = any tool. */
    tools?: string[];
}
export interface Candidate {
    /** The target path or glob (repo-relative; never absolute). */
    path: string;
    /** The one phrase the model reads; a candidate without a reason is not emitted. */
    reason: string;
    /** The static prior in [0,1]: 1.0 canonical, 0.6 family, 0.3 fallback. */
    prior: number;
}
export interface Intent {
    /** The intent id (e.g. "Layout"). */
    id: string;
    /** Priority: the lower number wins when two intents fire on one call. */
    priority: number;
    /** The confidence gate for this intent. */
    threshold: number;
    /** The signals that open the intent. */
    signals: Signal[];
    /** The ordered target set. */
    targets: Candidate[];
    /** The one-phrase caveat appended to the note. */
    note: string;
}
export default interface Pack {
    /** The pack name (this consumer's domain). */
    pack: string;
    /** The pack schema version. */
    version: number;
    /** The intents, priority-ordered. */
    intents: Intent[];
}
export interface CompiledSignal {
    rule: string;
    pattern: RegExp;
    weight: number;
    tools?: string[];
}
export interface CompiledIntent {
    id: string;
    priority: number;
    threshold: number;
    signals: CompiledSignal[];
    targets: Candidate[];
    note: string;
}
export interface Match {
    intent: CompiledIntent;
    k: number;
}
