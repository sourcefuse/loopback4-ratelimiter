import {CoreBindings, inject, Provider} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {RateLimitMetadata, RateLimitOptions} from '../types';
import {RateLimitSecurityBindings} from '../keys';
import {Store} from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import MemcachedStore from 'rate-limit-memcached';
import MongoStore from 'rate-limit-mongo';
import {juggler} from '@loopback/repository';
import {HttpErrors, RestApplication} from '@loopback/rest';

export class RatelimitDatasourceProvider
  implements Provider<Store | MemcachedStore | undefined>
{
  constructor(
    @inject.getter(RateLimitSecurityBindings.METADATA)
    private readonly getMetadata: Getter<RateLimitMetadata>,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    private readonly config?: RateLimitOptions,
  ) {}

  value(): Promise<Store | MemcachedStore | undefined> {
    return this.action();
  }

  async action(): Promise<Store | MemcachedStore | undefined> {
    const metadata: RateLimitMetadata = await this.getMetadata();

    // First check if rate limit options available at method level
    const operationMetadata = metadata ? metadata.options : {};

    // Create options based on global config and method level config
    const opts = Object.assign({}, this.config, operationMetadata);

    if (this.config?.type === 'MemcachedStore') {
      return new MemcachedStore({
        client: this.config?.client,
        expiration: (opts.windowMs ?? 60 * 1000) / 1000,
      });
    } else if (this.config?.type === 'MongoStore') {
      return new MongoStore({
        uri: this.config?.uri,
        collectionName: this.config?.collectionName,
        expireTimeMs: (opts.windowMs ?? 60 * 1000) / 1000,
      });
    } else {
      const redisDS = (await this.application.get(
        `datasources.${this.config?.name}`,
      )) as juggler.DataSource;
      if (redisDS?.connector) {
        return new RedisStore({
          client: redisDS.connector._client,
          expiry: (opts.windowMs ?? 60 * 1000) / 1000,
        });
      } else {
        throw new HttpErrors.InternalServerError('Invalid Datasource');
      }
    }
  }
}
