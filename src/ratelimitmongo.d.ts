
declare module 'rate-limit-mongo'
{
  declare namespace MongoStore {
    interface Options {
        name?:string,
        expiry?: number;
        prefix?: string;
        resetExpiryOnChange?: boolean;
        client?:  any;
        redisURL?: string;
    }
}

declare class MongoStore implements Store {
    constructor(options?: RedisStore.Options);
    incr(key: string, cb: StoreIncrementCallback): void;
    decrement(key: string): void;
    resetKey(key: string): void;

    resetAll(): void;
}

export = MongoStore;
}
