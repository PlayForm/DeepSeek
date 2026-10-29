import type { Context } from "@deepseek-ai/cordis";
type Disposer = () => void;
export default function Stream(ctx: Context): Disposer | undefined;
export {};
