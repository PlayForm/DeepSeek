import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * The pattern service's Schemastery schema: one constant built once at load.
 *
 * @remarks
 *
 * Composed with the factory's standalone Schema helper (`shared: false` - the
 * minimal block, only the universal log/logFile volatile cells; the service
 * hooks no fs/observed machinery). Every knob is a volatile cell so a hot
 * edit lands on the next service call without a remount. The service class
 * reads these through Configure; the defaults here are the truth. `enabled`
 * defaults to FALSE - the idle-forever posture: the patch row and the README
 * ship the service disabled; a cold mount logs `disabled (enabled=false)` and
 * Match returns the empty result (the abstention) while the service stays
 * resolvable.
 */
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
