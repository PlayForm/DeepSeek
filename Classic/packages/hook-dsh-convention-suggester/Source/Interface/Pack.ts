// Pack - the embedded pattern-pack types (SEARCH-SUGGESTER-PLUGIN.md §8.2,
// the pack-as-data contract; the convention consumer's projection per §9.4).
// This hook is a suggester-family CONSUMER that carries its own private pack
// (the two-consumer extraction rule: no shared core service until the family
// proves two consumers; Variable/Defaults.ts is the data). The types here
// are the contract both the classifier (Function/Detect) and the note
// builder consume.
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

// The compiled form: the regexes are built ONCE at apply (the hot path
// never compiles a regex - the plan's performance rule, section 4.3).
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

// The match a successful detection returns: the winning intent and its
// confidence. The empty suggestion (silence) is `null` - the algebra's
// identity element (plan §2.3).
export interface Match {
	intent: CompiledIntent;
	k: number;
}
