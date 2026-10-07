// Config — the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default (docs/user/develop/basic/config.md:45), so `apply`
// receives a plain object of this shape (volatile fields arrive as cells and
// are unwrapped by the factory's State builder). Since the factory refactor
// the schema is BUILT BY THE FACTORY (Variable/Config = factory.Schema) —
// the shared block (log, logFile, updateCooldownMs, mutationTools, policyFile,
// exclude) is factory machinery; the pinner's own field is `sections`. The
// pinner never reads `updateCooldownMs` (it has no update stage) — the field
// is included by the factory's shared schema for family parity.
//
// `sections` stays a plain `string[]` (the schema field is
// Schema.array(Schema.string())): the four documented values are the npm
// dependency sections, but the schema keeps the open array type so a
// deployment can pin a custom section name without a code edit.
export default interface Config {
	/** Factory shared field: ledger enabled — write the durable log file. */
	log: boolean;
	/** Factory shared field: ledger file (SEPARATE from the governor's). */
	logFile: string;
	/** Factory shared field: cooldown between update-stage dispatches — the
	 *  pinner never reads it (no update stage); included for family parity. */
	updateCooldownMs: number;
	/** Factory shared field: actor tool names whose fs/observed events trigger
	 *  pinning. */
	mutationTools: string[];
	/** Factory shared field: global pin-policy.json; empty means discovery +
	 *  built-in default. */
	policyFile: string;
	/** Dependency sections the pinner may rewrite (each must hold an object). */
	sections: string[];
	/** Factory shared field: excluded path segments (anywhere mode,
	 *  exclusion-first). */
	exclude: string[];
}
