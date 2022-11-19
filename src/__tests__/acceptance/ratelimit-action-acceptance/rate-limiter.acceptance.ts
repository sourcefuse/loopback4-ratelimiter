import {Client} from '@loopback/testlab';
import {memoryStore} from '../store.provider';
import {TestApplication} from './fixtures/application';
import {setUpApplication} from './helper';
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

  it('should hit end point when number of requests is less than max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < 4; i++) {
      await client.get('/test').expect(200);
    }
  });

  it('should hit end point when number of requests is equal to max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < 5; i++) {
      await client.get('/test').expect(200);
    }
  });

  it('should give error when number of requests is greater than max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < 5; i++) {
      await client.get('/test').expect(200);
    }
    await client.get('/test').expect(429);
  });

  it('should overwrite the default behaviour when rate limit decorator is applied', async () => {
    //Max request is set to 1 in decorator
    await client.get('/testDecorator').expect(200);
    await client.get('/testDecorator').expect(429);
  });

  it('should throw no error if requests more than max are sent after window resets', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < 5; i++) {
      await client.get('/test').expect(200);
    }
    setTimeout(() => {
      client
        .get('/test')
        .expect(200)
        .then(
          () => {},
          () => {},
        );
    }, 2000);
  });

  async function clearStore() {
    memoryStore.resetAll();
  }
});
