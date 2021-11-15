import {CoreBindings, inject, Provider} from '@loopback/core';
import {RateLimitOptions} from '../types';
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
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    private readonly config?: RateLimitOptions,
  ) {}

  async value(): Promise<Store | MemcachedStore | undefined> {
    if (this.config?.type === 'MemcachedStore') {
      return new MemcachedStore({
        client: this.config?.client,
        expiration: (this.config?.windowMs ?? 60 * 1000) / 1000,
      });
    } else if (this.config?.type === 'MongoStore') {
      return new MongoStore({
        uri: this.config?.uri,
        collectionName: this.config?.collectionName,
        expireTimeMs: (this.config?.windowMs ?? 60 * 1000) / 1000,
      });
    } else {
      const redisDS = (await this.application.get(
        `datasources.${this.config?.name}`,
      )) as juggler.DataSource;
      if (redisDS?.connector) {
        return new RedisStore({
          client: redisDS.connector._client,
          expiry: (this.config?.windowMs ?? 60 * 1000) / 1000,
        });
      } else {
        throw new HttpErrors.InternalServerError('Invalid Datasource');
      }
    }
  }
}
