import {RestApplication} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {RatelimitDatasourceProvider} from '../../providers';
import {RateLimitOptions} from '../../types';

describe('Rate Limit datasource Service', () => {
  const restApplication = new RestApplication();

  describe('Ratelimit datasource with config', () => {
    it('returns Memcached store if type is MemcachedStore', async () => {
      const config: RateLimitOptions = {
        name: 'test_name',
        type: 'MemcachedStore',
      };
      const ratelimitDatasourceProvider = new RatelimitDatasourceProvider(
        () => {
          return Promise.resolve({enabled: true});
        },
        restApplication,
        config,
      ).value();
      let result;
      await ratelimitDatasourceProvider.then(value => {
        result = value;
      });
      expect(result).to.have.properties(['expiration', 'prefix', 'client']);
    });

    it('returns Mongo store if type is MongoStore', async () => {
      const config: RateLimitOptions = {
        name: 'test_name',
        type: 'MongoStore',
        uri: 'test_uri',
        collectionName: 'test_collection_name',
      };
      const ratelimitDatasourceProvider = new RatelimitDatasourceProvider(
        () => {
          return Promise.resolve({enabled: true});
        },
        restApplication,
        config,
      ).value();
      let result;
      await ratelimitDatasourceProvider.then(value => {
        result = value;
      });
      expect(result).to.have.properties(['dbOptions', 'expireTimeMs']);
    });

    it('returns undefined if there is no redisDS', async () => {
      const config: RateLimitOptions = {
        name: 'test_name',
      };
      const ratelimitDatasourceProvider = await new RatelimitDatasourceProvider(
        () => {
          return Promise.resolve({enabled: true});
        },
        restApplication,
        config,
      )
        .value()
        .catch(err => err.msg);
      expect(ratelimitDatasourceProvider).to.eql(undefined);
    });
  });
});
