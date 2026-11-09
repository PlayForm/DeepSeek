import type { ClientContext } from "../Interface/Client.js";
export default function Client(ctx: ClientContext, config: {
    tabOrder: number;
    maxEvents: number;
    maxRepresentations: number;
}): void;
