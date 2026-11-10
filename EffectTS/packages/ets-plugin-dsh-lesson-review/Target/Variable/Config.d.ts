/**
 * @module Config
 *
 * The lesson-review service's Schemastery schema.
 *
 * @remarks
 * One constant built once at load. Composed with the factory's standalone Schema helper
 * (`shared: false` - the minimal block, only the universal log/logFile
 * volatile cells; the service hooks no fs/observed machinery). Every knob is
 * a volatile cell so a hot edit lands on the next service call without a
 * remount. The service class reads these through Configure; the defaults here
 * are the truth. `enabled` defaults to FALSE - the idle-forever posture: the
 * patch row and the README ship the service disabled; a cold mount logs
 * `disabled (enabled=false)` and Tick never comes due while the service stays
 * resolvable, so the nudge hook never hard-fails on a missing service.
 *
 * THE THREE BUDGETS are deliberately separate, because they bound different
 * costs: `intervalTurns` bounds how OFTEN a review may run, `digestTail` +
 * `maxInputChars` bound what one review SENDS, and `maxTokens` bounds what it
 * RECEIVES. A review that blows any of the three is a configuration defect,
 * not a runtime surprise.
 */
import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
}>>, "plain"> | Schema<Schemastery.ObjectS<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
    updateCooldownMs: Schema<number, number, "volatile-defined">;
    mutationTools: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: Schema<string, string, "defined">;
    exclude: Schema<string[], string[], "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
    updateCooldownMs: Schema<number, number, "volatile-defined">;
    mutationTools: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: Schema<string, string, "defined">;
    exclude: Schema<string[], string[], "defined">;
}>>, "plain">;
export default _default;
