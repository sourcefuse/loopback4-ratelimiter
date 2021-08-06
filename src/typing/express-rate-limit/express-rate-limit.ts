declare module 'express-rate-limit-updated' {
  type StoreIncrementCallback = (
    err?: {},
    hits?: number,
    resetTime?: Date,
  ) => void;

  interface Store {
    incr(key: string, cb: StoreIncrementCallback): void;
    decrement(key: string): void;
    resetKey(key: string): void;
    resetAll?(): void;
  }
}
