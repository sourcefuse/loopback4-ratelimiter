import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {TestApplication} from './fixtures/application';
export async function setUpApplication(): Promise<AppWithClient> {
  const app = new TestApplication({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: TestApplication;
  client: Client;
}
