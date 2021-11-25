import {CoreBindings, inject, Provider} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {Request, Response, RestApplication, HttpErrors} from '@loopback/rest';
import * as RateLimit from 'express-rate-limit';
import {RateLimitSecurityBindings} from '../keys';
import {RateLimitAction, RateLimitMetadata, RateLimitOptions} from '../types';

export class RatelimitActionProvider implements Provider<RateLimitAction> {
  constructor(
    @inject.getter(RateLimitSecurityBindings.DATASOURCEPROVIDER)
    private readonly getDatastore: Getter<RateLimit.Store>,
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
    const metadata: RateLimitMetadata = await this.getMetadata();
    const dataStore = await this.getDatastore();
    if (metadata && !metadata.enabled) {
      return Promise.resolve();
    }

    // Perform rate limiting now
    const promise = new Promise<void>((resolve, reject) => {
      // First check if rate limit options available at method level
      const operationMetadata = metadata ? metadata.options : {};

      // Create options based on global config and method level config
      const opts = Object.assign({}, this.config, operationMetadata);

      if (dataStore) {
        opts.store = dataStore;
      }

      opts.message = new HttpErrors.TooManyRequests(
        opts.message?.toString() ?? 'Method rate limit reached !',
      );

      const limiter = RateLimit.default(opts);
      limiter(request, response, (err: unknown) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
    await promise;
  }
}
