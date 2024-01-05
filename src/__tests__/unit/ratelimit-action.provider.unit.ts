import {Constructor} from '@loopback/core';
import {Request, Response, RestApplication} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import * as RateLimit from 'express-rate-limit';
import {IncrementResponse} from 'express-rate-limit';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import {RatelimitActionProvider} from '../../providers';

describe('Rate Limit action Service', () => {
  let RatelimitActionMockProvider: Constructor<RatelimitActionProvider>;
  beforeEach(setupMockRatelimitAction);

  const dataStore: RateLimit.Store = {
    increment,
    decrement,
    resetKey,
    resetAll,
  };

  const restApplication = new RestApplication();

  const rateLimitMetadataFalse = sinon.stub().resolves(
    Promise.resolve({
      enabled: false,
    }),
  );

  const rateLimitMetadataTrue = sinon.stub().resolves(
    Promise.resolve({
      enabled: true,
    }),
  );

  describe('Ratelimit action', () => {
    it('verifies whether value function returns a funtions', async () => {
      const result = new RatelimitActionMockProvider(
        dataStore,
        rateLimitMetadataFalse,
        restApplication,
      ).value();
      expect(result).to.have.Function();
    });

    it('returns promise if metadata is not enabled', async () => {
      const result = new RatelimitActionProvider(
        () => {
          return Promise.resolve(dataStore);
        },
        rateLimitMetadataFalse,
        restApplication,
      ).action({} as Request, {} as Response);
      await expect(result).to.be.fulfilled();
    });

    const EXPECT_TIMEOUT = 5000;
    it('returns promise if metadata is enabled', async () => {
      const result = new RatelimitActionMockProvider(
        dataStore,
        rateLimitMetadataTrue,
        restApplication,
      )
        .action({} as Request, {} as Response)
        .catch(err => err.message);
      await expect(result).to.be.fulfilled();
    }).timeout(EXPECT_TIMEOUT);
  });

  function increment(key: string): IncrementResponse {
    return {totalHits: 0, resetTime: new Date()};
  }
  function decrement(key: string): void {
    return;
  }
  function resetKey(key: string): void {
    return;
  }
  function resetAll(): void {
    return;
  }

  function setupMockRatelimitAction() {
    const mockExpressRatelimit = sinon.stub().returns({
      emit: sinon.stub().returns({}),
    });
    RatelimitActionMockProvider = proxyquire(
      '../../providers/ratelimit-action.provider',
      {
        'express-rate-limit': mockExpressRatelimit,
      },
    ).RatelimitActionProvider;
  }
});
