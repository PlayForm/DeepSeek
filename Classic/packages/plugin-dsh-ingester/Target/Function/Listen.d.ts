/**
 * @module Listen
 *
 * The bus registration (Function/Listen): the ingester's trace adapter,
 * registered from the service constructor (the class-form plugin's wiring
 * point).
 *
 * @remarks
 * - batch/proposed - the proposal is recorded (Function/Record);
 * - batch/decision - the decision is consumed (Function/Consume), which
 *   applies the validated change through the content fence.
 *
 * The names are registered STRUCTURALLY (a loose `on` cast): `batch/proposed`
 * and `batch/decision` are declared by the decision hook's package, which this
 * package does not import (the self-contained rule). Both listeners are
 * fail-open: a dead consumer can never break the emit dispatch.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State): void;
