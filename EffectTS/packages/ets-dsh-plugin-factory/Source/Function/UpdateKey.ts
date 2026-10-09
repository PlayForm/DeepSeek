// UpdateKey — the NAMESPACED State.Inflight key for UPDATE-STAGE controllers.
// The factory's chain pass (Function/Continue) registers its own controller
// under the PLAIN `String(targetKey)`; the two passes share the one map (the
// factory's Attach disposal aborts every entry on unload), so a collision
// would let the chain pass's settlement delete silently drop the update
// run's controller while its engine is still in flight — and a second edit
// during a long update would do exactly that (the cargo collision lesson:
// the cargo fixed it flavor-side with `update:` before the factory existed;
// now the helper is factory-side and the update stages adopt it).
import type { FsTarget } from "@deepseek-ai/dsh-fs";

export default (Target: FsTarget): string => `update:${String(Target.targetKey)}`;
