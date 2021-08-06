/* eslint-disable @typescript-eslint/naming-convention */
import {expect} from '@loopback/testlab';
import sinon from 'sinon';
import {getRateLimitMetadata, RateLimitMetadataProvider} from '../../providers';

describe('Rate Limit metadata Service', () => {
  describe('Ratelimit metadata class', () => {
    const methodName = 'test_method_name';
    it('returns undefined if there is no controller class or method name', () => {
      const controllerClass = class test {};
      const rateLimitMetadata = new RateLimitMetadataProvider(
        controllerClass,
        methodName,
      );
      const result = rateLimitMetadata.value();
      expect(result).to.eql(undefined);
    });

    it('return the enabled property from the function', () => {
      const controllerClass = class test {};
      const variable = {
        getRateLimitMetadata,
      };
      const fake = sinon.replace(
        variable,
        'getRateLimitMetadata',
        sinon.fake.returns({
          enabled: true,
        }),
      );
      const result = fake(controllerClass, methodName);
      expect(result).to.have.property('enabled');
    });
  });
});
