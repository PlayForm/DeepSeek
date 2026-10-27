export default _default;
declare function _default(Estimate: (Message: unknown) => number): (Events: readonly unknown[]) => {
    Surface: number;
    PerPath: Map<string, number>;
};
