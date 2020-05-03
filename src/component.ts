import {Binding, Component, ProviderMap} from '@loopback/core';

import {RateLimitSecurityBindings} from './keys';
import {RatelimitActionProvider, RateLimitMetadataProvider} from './providers';

export class RateLimiterComponent implements Component {
  constructor() {
    this.providers = {
      [RateLimitSecurityBindings.RATELIMIT_SECURITY_ACTION
        .key]: RatelimitActionProvider,
      [RateLimitSecurityBindings.METADATA.key]: RateLimitMetadataProvider,
    };
    this.bindings.push(
      Binding.bind(RateLimitSecurityBindings.CONFIG.key).to(null),
    );
  }

  providers?: ProviderMap;
  bindings: Binding[] = [];
}
