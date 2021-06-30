declare module 'rate-limit-mongo' {
  declare namespace MongoStore {
    interface Options {
      uri?: string;
      collectionName?: string;
      user?: string;
      password?: string;
      authSource?: string;
      collection?: object;
      connectionOptions?: object;
      expireTimeMs?: integer;
      resetExpireDateOnChange?: boolean;
      errorHandler?: function;
      createTtlIndex?: boolean;
    }
  }

  declare class MongoStore implements Store {
    constructor(options?: MongoStore.Options);
    getClient(callback: string): void;
    incr(key: string, cb: StoreIncrementCallback): void;
    decrement(key: string): void;
    resetKey(key: string): void;
    resetAll(): void;
  }

  export = MongoStore;
}
