/**
 * @module Pack
 *
 * Declares the intent types the classifier and the note builder consume.
 *
 * @remarks
 * SEARCH-SUGGESTER-PLUGIN.md §8.2, the pack-as-data contract; the graph consumer's
 * projection per §9.2.
 *
 * THE INTENTS ARE SYNTHESIZED PER CALL: Function/Apply builds the `Neighborhood` and
 * `Sibling` intents from the workspace graph query's own answer and prepends them as
 * data. The private literal pack (Variable/Defaults.ts) is RETIRED from the hot path and
 * nothing imports it; its `Pack` shape below survives only as the retired reference
 * table's type.
 */
export interface Signal {
    /**
     * The rule name, for the ledger and the smokes.
     */
    rule: string;
    /**
     * The regex source, tested against the call probe (tool name + arguments JSON).
     */
    pattern: string;
    /**
     * The weight added to the intent's score when the signal matches.
     */
    weight: number;
    /**
     * Optional tool-name restriction: empty/undefined = any tool.
     */
    tools?: string[];
}
export interface Candidate {
    /**
     * The target path, as the graph answered it (repo-relative or its display path; never
     * invented).
     */
    path: string;
    /**
     * The one phrase the model reads; a candidate without a reason is not emitted.
     */
    reason: string;
    /**
     * The static prior in [0,1]: 1.0 canonical (a graph entry), 0.6 family, 0.3
     * illustrative.
     */
    prior: number;
}
export interface Intent {
    /**
     * The intent id (e.g. "Neighborhood").
     */
    id: string;
    /**
     * Priority: the lower number wins when two intents fire on one call.
     */
    priority: number;
    /**
     * The confidence gate for this intent.
     */
    threshold: number;
    /**
     * The signals that open the intent.
     */
    signals: Signal[];
    /**
     * The ordered target set.
     */
    targets: Candidate[];
    /**
     * The one-phrase caveat appended to the note.
     */
    note: string;
}
export default interface Pack {
    /**
     * The pack name (this consumer's domain).
     */
    pack: string;
    /**
     * The pack schema version.
     */
    version: number;
    /**
     * The intents, priority-ordered (the retired reference table's shape).
     */
    intents: Intent[];
}
/**
 * The compiled form: the regexes are built ONCE at apply (the hot path never compiles a
 * regex - the plan's performance rule, section 4.3).
 */
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
/**
 * The match a successful detection returns: the winning intent and its confidence. The
 * empty suggestion (silence) is `null` - the algebra's identity element (plan §2.3).
 */
export interface Match {
    intent: CompiledIntent;
    k: number;
}
