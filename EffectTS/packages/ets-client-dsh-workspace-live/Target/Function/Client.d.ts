import type { Context } from "@deepseek-ai/cordis";
export default function Client(ctx: Context, config: {
    tabOrder: number;
    maxEvents: number;
    maxRepresentations: number;
}): void;
