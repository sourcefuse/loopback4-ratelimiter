import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {Store} from 'express-rate-limit';
import {RateLimitOptions, RateLimitSecurityBindings} from '../../..';
import {InMemoryStore} from './in-memory-store';
export const memoryStore = new InMemoryStore();
export class StoreProvider implements Provider<Store> {
  constructor(
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    private readonly config?: RateLimitOptions,
  ) {}
  value(): ValueOrPromise<Store> {
    const windowMs = this.config?.windowMs ?? 60000;
    memoryStore.setInterval(windowMs);
    return memoryStore;
  }
}
