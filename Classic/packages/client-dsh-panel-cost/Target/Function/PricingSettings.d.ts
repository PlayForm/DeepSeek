import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type PricingSettingsProps = {
    readonly sessionId: string;
    readonly rows: number;
    readonly t: Translate;
    readonly onPublished?: (RevisionId: number) => void;
};
export default function PricingSettings(Props: PricingSettingsProps): ReturnType<typeof createElement>;
export {};
