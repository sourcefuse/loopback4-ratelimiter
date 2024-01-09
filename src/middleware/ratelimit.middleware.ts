// @SONAR_STOP@
import {CoreBindings, inject, injectable, Next, Provider} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {
  Request,
  Response,
  RestApplication,
  HttpErrors,
  Middleware,
  MiddlewareContext,
  asMiddleware,
  RestMiddlewareGroups,
} from '@loopback/rest';
import * as RateLimit from 'express-rate-limit';
import {RateLimitSecurityBindings} from '../keys';
import {RateLimitMetadata, RateLimitOptions} from '../types';
import {RatelimitActionMiddlewareGroup} from './middleware.enum';
@injectable(
  asMiddleware({
    group: RatelimitActionMiddlewareGroup.RATELIMIT,
    upstreamGroups: RestMiddlewareGroups.PARSE_PARAMS,
    downstreamGroups: [RestMiddlewareGroups.INVOKE_METHOD],
  }),
)
export class RatelimitMiddlewareProvider implements Provider<Middleware> {
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

  value() {
    const middleware = async (ctx: MiddlewareContext, next: Next) => {
      await this.action(ctx.request, ctx.response);
      return next();
    };
    return middleware;
  }

  async action(request: Request, response: Response): Promise<void> {
    const enabledByDefault = this.config?.enabledByDefault ?? true;
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
      const opts = {...this.config, ...operationMetadata};

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
    if (enabledByDefault === true) {
      await promise;
    } else if (enabledByDefault === false && metadata && metadata.enabled) {
      await promise;
    } else {
      return Promise.resolve();
    }
  }
}
// @SONAR_START@
