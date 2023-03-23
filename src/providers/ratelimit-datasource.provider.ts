import {CoreBindings, inject, Provider} from '@loopback/core';
import {Getter, juggler} from '@loopback/repository';
import {RateLimitMetadata, RateLimitOptions, Store} from '../types';
import {RateLimitSecurityBindings} from '../keys';
import RedisStore, {RedisReply} from 'rate-limit-redis';
import MemcachedStore from 'rate-limit-memcached';
import MongoStore from 'rate-limit-mongo';
import {HttpErrors, RestApplication} from '@loopback/rest';
import {TextDecoder} from 'util';
const decoder = new TextDecoder('utf-8');
export class RatelimitDatasourceProvider implements Provider<Store> {
  constructor(
    @inject.getter(RateLimitSecurityBindings.METADATA)
    private readonly getMetadata: Getter<RateLimitMetadata>,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    private readonly config?: RateLimitOptions,
  ) {}

  value(): Promise<Store> {
    return this.action();
  }

  async action(): Promise<Store> {
    const metadata: RateLimitMetadata = await this.getMetadata();

    const operationMetadata = metadata?.options ?? {};

    const opts = {...this.config, ...operationMetadata};
    const var1 = 60;
    const var2 = 1000;

    if (this.config?.type === 'MemcachedStore') {
      const expiration = (opts.windowMs ?? var1 * var2) / var2;
      return new MemcachedStore({client: this.config?.client, expiration});
    }

    if (this.config?.type === 'MongoStore') {
      const expireTimeMs = (opts.windowMs ?? var1 * var2) / var2;
      return new MongoStore({
        uri: this.config?.uri,
        collectionName: this.config?.collectionName,
        expireTimeMs,
      });
    }

    const redisDS = (await this.application.get(
      `datasources.${this.config?.name}`,
    )) as juggler.DataSource;
    if (redisDS?.connector) {
      const sendCommand = async (...args: string[]) => {
        const command = `${args[0]}`;
        args.splice(0, 1);
        try {
          let res = await this.executeRedisCommand(redisDS, command, args);
          if (command.toLocaleLowerCase() === 'script') {
            res = decoder.decode(res as ArrayBuffer);
          }
          return res as RedisReply;
        } catch (err) {
          throw new Error(`Could not execute redis command ${err}`);
        }
      };
      return new RedisStore({sendCommand});
    }

    throw new HttpErrors.InternalServerError('Invalid Datasource');
  }

  // returns promisified execute function
  executeRedisCommand(
    dataSource: juggler.DataSource,
    command: string,
    args: (string | number)[],
  ) {
    return new Promise((resolve, reject) => {
      if (dataSource.connector?.execute) {
        // eslint-disable-next-line  @typescript-eslint/no-floating-promises
        dataSource.connector.execute(
          command,
          args,
          (err: Error, res: Buffer) => {
            if (err) {
              reject(err);
            }
            if (res) {
              resolve(res);
            } else {
              return resolve(undefined);
            }
          },
        );
      }
    });
  }
}
