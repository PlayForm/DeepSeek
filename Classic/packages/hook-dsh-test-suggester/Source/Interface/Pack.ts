/**
 * @module Pack
 *
 * The pattern-pack types (the pack-as-data contract both the classifier and
 * the note builder consume).
 *
 * @remarks
 * SEARCH-SUGGESTER-PLUGIN.md §8.2. This hook is a suggester-family CONSUMER:
 * the types here are the contract both the classifier (`Function/Detect`) and
 * the note builder consume. The rows are no longer a built-in projection
 * (`Variable/Defaults` is RETIRED from the hot path): they arrive per call
 * from the session history (the synthetic `History` family, `Function/Apply`)
 * and from an EXPLICIT repo/user pack (`Resolve(root, { builtin: false })`).
 *
 * A pack intent is: an id, a priority (lower wins when two fire on one call),
 * a per-intent threshold (destructive intents raise it), a signal list (regex
 * + optional tool restriction + weight; the confidence is
 * k = sigmoid(sum(weights) + bias) per the plan §3.5, bias -0.6), a target
 * list (path/glob + prior + reason - a candidate without a reason is never
 * emitted), and the note phrase appended to every note.
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

/**
 * One pack target candidate: the path, the reason, and the static prior.
 */
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

/**
 * One pack intent: the id, the priority, the threshold, the signals, the
 * targets, and the note phrase.
 */
export interface Intent {
	/**
	 * The intent id (e.g. "Suite").
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

/**
 * A resolved pack: the name, the schema version, and the priority-ordered
 * intents.
 */
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
 * The compiled form of one signal: the regex is built ONCE at apply (the hot
 * path never compiles a regex - the plan's performance rule, section 4.3).
 */
export interface CompiledSignal {
	rule: string;
	pattern: RegExp;
	weight: number;
	tools?: string[];
}

/**
 * The compiled form of one intent: the regexes are precompiled.
 */
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
 * identity element (plan §2.3).
 */
export interface Match {
	intent: CompiledIntent;
	k: number;
}
