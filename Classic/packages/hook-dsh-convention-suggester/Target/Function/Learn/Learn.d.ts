import { type Located } from "@playform/lib-dsh-pack";
import type Learned from "../../Interface/Learned.js";
export default _default;
declare function _default(
/** The config's `learning` switch (the config wins when true). */
Enabled: boolean, 
/** The workspace gate's answer (undefined: no workspace resolved). */
Gate: Located | undefined, 
/** The call path the judged call names. */
CallPath: string, 
/** The session cwd, when the harness service exposes one. */
Cwd: string | undefined, 
/** The home the proposal hangs off (the user layer's parent). */
Home: string): Learned | undefined;
