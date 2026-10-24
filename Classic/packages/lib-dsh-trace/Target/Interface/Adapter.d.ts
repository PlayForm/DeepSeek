import type Draft from "./Draft.js";
import type Envelope from "./Envelope.js";
export default interface Adapter {
    /** Publish one draft; the bus completes the envelope and dispatches it. */
    emit(Draft: Draft): void;
    /** Subscribe to one event name; the returned disposer unsubscribes. */
    on(Name: string, Listener: (Envelope: Envelope) => void): () => void;
}
