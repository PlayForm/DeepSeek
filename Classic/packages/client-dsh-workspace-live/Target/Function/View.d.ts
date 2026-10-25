import type { LiveView } from "@Interface/Presentation.js";
import type { TraceEnvelope } from "@Interface/Trace.js";
import { createElement, type ReactNode } from "react";
export default function View(props: {
    view: LiveView;
    tail: readonly TraceEnvelope[];
    live: boolean;
    slot?: ReactNode;
}): ReturnType<typeof createElement>;
