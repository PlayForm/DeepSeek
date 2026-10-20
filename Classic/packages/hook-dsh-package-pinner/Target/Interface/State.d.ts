import type { State as Shared } from "@playform/plugin-dsh-factory";
export default interface State extends Shared {
    /** Dependency sections the pinner may rewrite (config `sections`). */
    Section: string[];
}
