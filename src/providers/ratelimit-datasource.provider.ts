import {CoreBindings, inject, Provider} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {RateLimitMetadata, RateLimitOptions, Store} from '../types';
import {RateLimitSecurityBindings} from '../keys';
import RedisStore, {RedisReply} from 'rate-limit-redis';
import MemcachedStore from 'rate-limit-memcached';
import MongoStore from 'rate-limit-mongo';
import {juggler} from '@loopback/repository';
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
          sendCommand: async (...args: string[]) => {
            const command = `${args[0]}`;
            args.splice(0, 1);
            let res;
            try {
              res = await this.executeRedisCommand(redisDS, command, args);
              if (command.toLocaleLowerCase() === 'script') {
                res = decoder.decode(res as ArrayBuffer);
              }
            } catch (err) {
              throw new Error(`Could not execute redis command ${err}`);
            }
            return res as RedisReply;
          },
        });
      } else {
        throw new HttpErrors.InternalServerError('Invalid Datasource');
      }
    }
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
