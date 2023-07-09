import {Binding, Component, inject, ProviderMap} from '@loopback/core';
import {createMiddlewareBinding} from '@loopback/rest';
import {RateLimitSecurityBindings} from './keys';
import {RatelimitMiddlewareProvider} from './middleware';
import {
  RatelimitActionProvider,
  RateLimitMetadataProvider,
  RatelimitDatasourceProvider,
} from './providers';
import {RateLimitMiddlewareConfig, RateLimitOptions} from './types';

export class RateLimiterComponent implements Component {
  constructor(
    @inject(RateLimitSecurityBindings.RATELIMITCONFIG, {optional: true})
    private readonly ratelimitConfig?: RateLimitMiddlewareConfig,
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    private readonly configOptions?: RateLimitOptions,
  ) {
    this.providers = {
      [RateLimitSecurityBindings.RATELIMIT_SECURITY_ACTION.key]:
        RatelimitActionProvider,
      [RateLimitSecurityBindings.DATASOURCEPROVIDER.key]:
        RatelimitDatasourceProvider,
      [RateLimitSecurityBindings.METADATA.key]: RateLimitMetadataProvider,
    };
    if (!this.configOptions) {
      this.bindings.push(
        Binding.bind(RateLimitSecurityBindings.CONFIG.key).to(null),
      );
    }
    if (this.ratelimitConfig?.RatelimitActionMiddleware) {
      this.bindings.push(createMiddlewareBinding(RatelimitMiddlewareProvider));
    }
  }

  providers?: ProviderMap;
  bindings: Binding[] = [];
}
