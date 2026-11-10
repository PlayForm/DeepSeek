import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
/**
 * PricingSettingsProps - what the view hands the pane: the session the preview reads, the row
 * budget it reads with, the translator, and the callback that pins a freshly published revision as
 * the panel's valuation.
 */
type PricingSettingsProps = {
    readonly sessionId: string;
    readonly rows: number;
    readonly t: Translate;
    readonly onPublished?: (RevisionId: number) => void;
};
export default function PricingSettings(Props: PricingSettingsProps): ReturnType<typeof createElement>;
export {};
