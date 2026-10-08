import { Effect } from "effect";
import { Ledger as LedgerService } from "../Service/Ledger.js";
import { Write as WriteService } from "../Service/Write.js";
import type State from "@Interface/State.js";
import type Transform from "@Interface/Transform.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
export default _default;
declare function _default(State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Found: string | null, Version: FsVersion, Transform: Transform): Effect.Effect<void, never, LedgerService | WriteService>;
