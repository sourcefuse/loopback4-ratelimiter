import {Provider, ValueOrPromise} from '@loopback/core';
import {Store} from 'express-rate-limit';

// InMemoryStore is no longer used as a shared store in v8
// express-rate-limit v8 creates its own InMemoryStore instances internally
// This provider now returns null to use the default InMemoryStore

export class StoreProvider implements Provider<Store | null> {
  value(): ValueOrPromise<Store | null> {
    // Return null to let express-rate-limit v8 create its own InMemoryStore
    // Each RateLimit instance will have its own store with proper state management
    return null;
  }
}

// Export empty memoryStore object for backward compatibility with tests
export const memoryStore = {
  resetAll: (): void => {
    // No-op since stores are managed by express-rate-limit v8
    // Rate limit state will be reset between tests via cache clearing
  },
};
