import {Request, Response} from '@loopback/rest';
import {Options} from 'express-rate-limit';
import {RedisClient} from 'redis';
import IORedis = require('ioredis');

export type RedisClientType = IORedis.Redis | RedisClient;

export interface DataSourceConfig {
  name: string;
  client?: string | RedisClientType | undefined;
  type?: string;
  uri?: string;
  collectionName?: string;
}

export interface RateLimitAction {
  (request: Request, response: Response): Promise<void>;
}

export type RateLimitOptions = Options & DataSourceConfig;

/**
 * Rate limit metadata interface for the method decorator
 */
export interface RateLimitMetadata {
  enabled: boolean;
  options?: Options;
}
