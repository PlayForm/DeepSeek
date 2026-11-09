import { createElement } from "react";
export default function View(props: {
    sessionId?: string;
    t?: (key: string) => string;
}): ReturnType<typeof createElement>;
