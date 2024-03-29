import {Request, Response} from '@loopback/rest';
import {Options} from 'express-rate-limit';
import MemcachedStore from 'rate-limit-memcached';
import MongoStore from 'rate-limit-mongo';
import RedisStore from 'rate-limit-redis';
import {RedisClient} from 'redis';
import IORedis = require('ioredis');

export type RedisClientType = IORedis.Redis | RedisClient;

export interface DataSourceConfig {
  name: string;
  client?: string | RedisClientType;
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
