import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {Store} from 'express-rate-limit';
import {RateLimitSecurityBindings} from '../../keys';
import {RateLimitOptions} from '../../types';
import {InMemoryStore} from './in-memory-store';
export const memoryStore = new InMemoryStore();
export class StoreProvider implements Provider<Store> {
  constructor(
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    private readonly config?: RateLimitOptions,
  ) {}
  value(): ValueOrPromise<Store> {
    const DEFAULT_WINDOW_MS = 60000;
    const windowMs = this.config?.windowMs ?? DEFAULT_WINDOW_MS;
    memoryStore.setInterval(windowMs);
    return memoryStore;
  }
}
