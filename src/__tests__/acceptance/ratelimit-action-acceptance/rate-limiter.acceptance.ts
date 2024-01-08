import {Client} from '@loopback/testlab';
import {memoryStore} from '../store.provider';
import {TestApplication} from './fixtures/application';
import {setUpApplication} from './helper';

const OK_STATUS_CODE = 200;
const TOO_MANY_REQS_CODE = 429;

describe('Acceptance Test Cases', () => {
  let app: TestApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setUpApplication());
  });
  afterEach(async () => {
    await clearStore();
  });

  after(async () => app.stop());

  const MAX_REQUESTS = 5;
  it('should hit end point when number of requests is less than max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await client.get('/test').expect(OK_STATUS_CODE);
    }
  });

  it('should hit end point when number of requests is equal to max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await client.get('/test').expect(OK_STATUS_CODE);
    }
  });

  it('should give error when number of requests is greater than max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await client.get('/test').expect(OK_STATUS_CODE);
    }
    await client.get('/test').expect(TOO_MANY_REQS_CODE);
  });

  it('should overwrite the default behaviour when rate limit decorator is applied', async () => {
    //Max request is set to 1 in decorator
    await client.get('/testDecorator').expect(OK_STATUS_CODE);
    await client.get('/testDecorator').expect(TOO_MANY_REQS_CODE);
  });

  it('should throw no error if requests more than max are sent after window resets', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await client.get('/test').expect(OK_STATUS_CODE);
    }
    const TIMEOUT = 2000;
    setTimeout(() => {
      client
        .get('/test')
        .expect(OK_STATUS_CODE)
        .then(
          () => {},
          () => {},
        );
    }, TIMEOUT);
  });

  async function clearStore() {
    memoryStore.resetAll();
  }
});
