import {Request, Response} from '@loopback/rest';
import {Options} from 'express-rate-limit';
import {MemcachedStore} from 'rate-limit-memcached';
import MongoStore = require('rate-limit-mongo');
import {RedisStore} from 'rate-limit-redis';
import type {Redis as IORedis} from 'ioredis';
import type Memcached from 'memcached';

export type RedisClientType = IORedis;

// Extract only the methods we need from Memcached class
export type MemcachedClient = Pick<
  Memcached,
  'get' | 'set' | 'add' | 'del' | 'incr' | 'decr'
>;

export interface DataSourceConfig {
  name: string;
  client?: string | RedisClientType | MemcachedClient;
  type?: string;
  uri?: string;
  collectionName?: string;
}
export interface RateLimitConfig {
  enabledByDefault?: boolean;
}
export type RateLimitAction = (
  request: Request,
  response: Response,
) => Promise<void>;

export type RateLimitOptions = Writable<Partial<Options>> &
  DataSourceConfig &
  RateLimitConfig;

/**
 * Rate limit metadata interface for the method decorator
 */
export interface RateLimitMetadata {
  enabled: boolean;
  options?: Partial<Options>;
}

export type Store = MemcachedStore | MongoStore | RedisStore;
export type Writable<T> = {-readonly [P in keyof T]: T[P]};
export interface RateLimitMiddlewareConfig {
  RatelimitActionMiddleware?: boolean;
}
