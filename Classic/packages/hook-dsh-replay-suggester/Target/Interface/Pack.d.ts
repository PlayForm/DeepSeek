/**
 * @module Pack
 *
 * The embedded pattern-pack types: the pack-as-data contract the classifier
 * and the note builder consume.
 *
 * @remarks
 *
 * SEARCH-SUGGESTER-PLUGIN.md §8.2 defines the pack-as-data contract; §9.3 is
 * the replay consumer's projection. This hook is a suggester-family CONSUMER
 * whose rows arrive per call: the synthesized `Repeat` family from the recall
 * (Function/Apply) and, when one exists, an EXPLICIT repo/user pack
 * (`Resolve(root, { builtin: false })`). The built-in projection
 * (Variable/Defaults) is RETIRED from the hot path. The types here are the
 * contract both the classifier (Function/Detect) and the note builder
 * consume.
 */
export interface Signal {
    /**
     * The rule name, for the ledger and the smokes.
     */
    rule: string;
    /**
     * The regex source, tested against the call probe (tool name + arguments
     * JSON).
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
     * The target path or glob (repo-relative; never absolute).
     */
    path: string;
    /**
     * The one phrase the model reads; a candidate without a reason is not
     * emitted.
     */
    reason: string;
    /**
     * The static prior in [0,1]: 1.0 canonical, 0.6 family, 0.3 fallback.
     */
    prior: number;
}
export interface Intent {
    /**
     * The intent id (e.g. "Repeat").
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
     * The ordered target set (the static fallback when no history record
     * resolves).
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
     * The intents, priority-ordered.
     */
    intents: Intent[];
}
/**
 * The compiled form: the regexes are built ONCE at apply (the hot path
 * never compiles a regex - the plan's performance rule, section 4.3).
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
 * The match a successful detection returns: the winning intent and its
 * confidence. The empty suggestion (silence) is `null` - the algebra's
 * identity element (plan §2.3). The confidence is the sigmoid of the
 * matching signals' weights alone: the history evidence IS the synthesized
 * family's `history` signal, never a separate lift.
 */
export interface Match {
    intent: CompiledIntent;
    k: number;
}
