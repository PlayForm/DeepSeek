import type { Translate } from "./Translate.js";
export default interface ViewProps {
    sessionId?: string;
    t?: Translate;
    rows?: number;
}
