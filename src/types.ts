import {Request, Response} from '@loopback/rest';
import {Options} from 'express-rate-limit';
export interface DataSourceConfig {
  name: string;
  client?: any;
  type?: string;
  uri?:string,
  collectionName?:string
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
