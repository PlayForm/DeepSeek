import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Config: Config): {
    Push(Session: unknown, Event: unknown): void;
    Take(SessionId: string): readonly unknown[];
    Peek(SessionId: string): readonly unknown[];
    Acknowledge(SessionId: string, Count: number): number;
    Size(): number;
};
