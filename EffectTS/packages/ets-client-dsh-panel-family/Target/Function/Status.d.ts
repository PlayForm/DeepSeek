/**
 * @module Status
 *
 * Resolve one adapter's status from its declared static posture and the
 * panel's live trace tail.
 *
 * @remarks
 * The tail lines are byte-exact `<kind> <key>` strings, where the key is the
 * envelope's payload path when it carries one (the coalescing key of the D5
 * contract) and its trace id otherwise. The activation state is the adapter's
 * declared posture unless the newest matching envelope carries
 * `payload.activation` of "enabled" or "disabled" - the one live override the
 * panel honours. Without a trace the status is static and the tail is empty
 * (the documented fallback).
 */
import type { PanelSection, PanelStatus } from "@Interface/Panel.js";
import type { PanelLive } from "@Interface/Trace.js";
export default function Status(Section: PanelSection, Live: PanelLive | undefined): PanelStatus;
