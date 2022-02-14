import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {RateLimiterComponent, RateLimitSecurityBindings} from '../../../';
import {TestController} from './test.controller';
import {StoreProvider} from './store.provider';
export {ApplicationConfig};
export class TestApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.sequence(MySequence);

    this.static('/', path.join(__dirname, '../public'));
    this.component(RateLimiterComponent);

    this.projectRoot = __dirname;
    this.controller(TestController);
    this.bind(RateLimitSecurityBindings.DATASOURCEPROVIDER).toProvider(
      StoreProvider,
    );

    this.bind(RateLimitSecurityBindings.CONFIG).to({
      name: 'inMemory',
      max: 5,
      windowMs: 2000,
    });
  }
}
