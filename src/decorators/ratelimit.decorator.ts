import {MethodDecoratorFactory} from '@loopback/core';
import {RateLimitMetadata} from '../types';
import {Options} from 'express-rate-limit';
import {RATELIMIT_METADATA_ACCESSOR} from '../keys';

export function ratelimit(enabled: boolean, options?: Options) {
  return MethodDecoratorFactory.createDecorator<RateLimitMetadata>(
    RATELIMIT_METADATA_ACCESSOR,
    {
      enabled: enabled,
      options,
    },
  );
}
