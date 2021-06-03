import {inject, Provider} from '@loopback/core';
import {  RateLimitOptions } from '../types'
import {RateLimitSecurityBindings} from '../keys';
import {Store} from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import MemcachedStore from 'rate-limit-memcached';
import MongoStore from 'rate-limit-mongo';
type StoreIncrementCallback = (err?: {}, hits?: number, resetTime?: Date) => void;
export class RatelimitDatasourceProvider implements Provider<Store | undefined>
{


  constructor(
  @inject(RateLimitSecurityBindings.CONFIG, {optional: true,})
  private readonly config?: RateLimitOptions,
  ){}

  value(): Store | undefined
  {

    if(this.config?.type ==  'MemcachedStore')
    return new MemcachedStore({client: this.config?.client, expiration: (this.config?.windowMs ?? 60 * 1000) / 1000} );

    if(this.config?.type ==  'RedisStore' )
    return new RedisStore({client: this.config?.client, expiry: (this.config?.windowMs ?? 60 * 1000) / 1000});

    if(this.config?.type ==  'MongoStore' )
    return new MongoStore({uri: this.config?.uri, collectionName:this.config?.collectionName ,expireTimeMs: (this.config?.windowMs ?? 60 * 1000) / 1000});

  }
  incr(key: string, cb: StoreIncrementCallback)
  {

  }
  decrement(key: string)
  {

  }
  resetKey(key: string)
  {

  }
  resetAll()
  {

  }




}
