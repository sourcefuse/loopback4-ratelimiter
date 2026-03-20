import {CoreBindings, inject, Provider} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {HttpErrors, Request, Response, RestApplication} from '@loopback/rest';

import * as RateLimit from 'express-rate-limit';
import {RateLimitSecurityBindings} from '../keys';
import {RateLimitAction, RateLimitMetadata, RateLimitOptions} from '../types';

// Cache for RateLimit instances to avoid store reuse error in v8
const rateLimitCache = new Map<string, RateLimit.RateLimitRequestHandler>();

function getRateLimiterKey(opts: Partial<RateLimitOptions>): string {
  return JSON.stringify(opts);
}

// Export function to clear cache for testing
export function clearRateLimitCache(): void {
  rateLimitCache.clear();
}

export class RatelimitActionProvider implements Provider<RateLimitAction> {
  constructor(
    @inject.getter(RateLimitSecurityBindings.DATASOURCEPROVIDER)
    private readonly getDatastore: Getter<RateLimit.Store | null>,
    @inject.getter(RateLimitSecurityBindings.METADATA)
    private readonly getMetadata: Getter<RateLimitMetadata>,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
    @inject(RateLimitSecurityBindings.CONFIG, {
      optional: true,
    })
    private readonly config?: RateLimitOptions,
  ) {}

  value(): RateLimitAction {
    return (req, resp) => this.action(req, resp);
  }

  async action(request: Request, response: Response): Promise<void> {
    const enabledByDefault = this.config?.enabledByDefault ?? true;
    const metadata: RateLimitMetadata = await this.getMetadata();
    const dataStore = await this.getDatastore();
    if (metadata && !metadata.enabled) {
      return Promise.resolve();
    }

    // Perform rate limiting now
    const promise = () =>
      new Promise<void>((resolve, reject) => {
        // First check if rate limit options available at method level
        const operationMetadata = metadata ? metadata.options : {};

        // Create options based on global config and method level config
        const rawOpts = {...this.config, ...operationMetadata};

        // Filter out unsupported options for express-rate-limit v8
        // 'name' is no longer supported in v8
        // 'client', 'type', 'uri', 'collectionName' are custom DataSourceConfig options
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {
          name,
          client,
          type,
          uri,
          collectionName,
          store: originalStore,
          ...opts
        } = rawOpts as RateLimitOptions & {store?: unknown};
        /* eslint-enable @typescript-eslint/no-unused-vars */

        // If dataStore is null or undefined, don't set the store property
        // express-rate-limit v8 will create its own InMemoryStore
        if (dataStore) {
          (opts as RateLimit.Options).store = dataStore;
        }

        opts.message = new HttpErrors.TooManyRequests(
          opts.message?.toString() ?? 'Method rate limit reached !',
        );

        // Get or create a RateLimit instance for this configuration
        // This avoids the "store reuse" error in express-rate-limit v8
        // Note: We exclude 'store' from cache key since each store instance is unique
        const cacheKey = getRateLimiterKey(opts);
        let limiter = rateLimitCache.get(cacheKey);

        if (!limiter) {
          limiter = RateLimit.default(opts);
          rateLimitCache.set(cacheKey, limiter);
        }

        limiter(request, response, (err: unknown) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    if (enabledByDefault === true) {
      await promise();
      // eslint-disable-next-line  @typescript-eslint/prefer-optional-chain
    } else if (enabledByDefault === false && metadata && metadata.enabled) {
      await promise();
    } else {
      return Promise.resolve();
    }
  }
}
