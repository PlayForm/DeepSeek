import type { LiveView } from "../Interface/Presentation.js";
import type LiveTrace from "../Interface/Trace.js";
import { createElement } from "react";
export default function Section(props: {
    ports: {
        store: {
            getSnapshot: () => LiveView;
            subscribe: (listener: () => void) => () => void;
        };
        trace: LiveTrace;
    };
}): ReturnType<typeof createElement>;
