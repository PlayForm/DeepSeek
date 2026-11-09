import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type ContributionsPageProps = {
    path: string;
    currency: string;
    t: Translate;
};
export default function ContributionsPage(Props: ContributionsPageProps): ReturnType<typeof createElement>;
export {};
