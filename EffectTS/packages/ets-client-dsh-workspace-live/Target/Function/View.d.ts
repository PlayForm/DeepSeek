/**
 * @module View
 *
 * The live view's pure element builder.
 *
 * @remarks
 * It presents the representations (the Entity/Presentation/Interaction model's
 * latest observed state, never a running OS process), the documented empty
 * note, the D5 trace tail (newest first, bounded by the store; one line per
 * envelope as `<kind> <path>`, the payload's path when it carries one, else the
 * envelope's trace id), and the child-slot element the tab/section hands in. No
 * hooks and no service reads: the wrappers own the subscriptions, so the smoke
 * suite can inspect the exact tree.
 */
import type { LiveView } from "../Interface/Presentation.js";
import type { TraceEnvelope } from "../Interface/Trace.js";
import { createElement, type ReactNode } from "react";
export default function View(props: {
    view: LiveView;
    tail: readonly TraceEnvelope[];
    live: boolean;
    slot?: ReactNode;
}): ReturnType<typeof createElement>;
