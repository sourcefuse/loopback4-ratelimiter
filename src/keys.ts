import {BindingKey, MetadataAccessor} from '@loopback/core';
import {Store} from 'express-rate-limit';
import {RateLimitAction, RateLimitOptions, RateLimitMetadata} from './types';

export namespace RateLimitSecurityBindings {
  export const RATELIMIT_SECURITY_ACTION = BindingKey.create<RateLimitAction>(
    'sf.security.ratelimit.actions',
  );

  export const METADATA = BindingKey.create<RateLimitMetadata | undefined>(
    'sf.security.ratelimit.operationMetadata',
  );

  export const CONFIG = BindingKey.create<RateLimitOptions | null>(
    'sf.security.ratelimit.config',
  );

  export const DATASOURCEPROVIDER = BindingKey.create<Store | null>(
    'sf.security.ratelimit.datasourceProvider',
  );
}

export const RATELIMIT_METADATA_ACCESSOR = MetadataAccessor.create<
  RateLimitMetadata,
  MethodDecorator
>('sf.security.ratelimit.operationMetadata.accessor');
