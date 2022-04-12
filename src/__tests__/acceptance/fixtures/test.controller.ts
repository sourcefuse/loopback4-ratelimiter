import {get} from '@loopback/rest';
import {ratelimit} from '../../..';

export class TestController {
  constructor() {}
  @get('/test', {
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '200': {
        description: 'Test End Point Called',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: {
              type: 'object',
              title: 'TestResponse',
              properties: {
                message: {type: 'string'},
                date: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  test() {
    return {
      message: 'You have successfully called test end point',
      date: new Date(),
    };
  }

  @ratelimit(true, {
    max: 1,
  })
  @get('/testDecorator', {
    responses: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '200': {
        description: 'Test Decorator End Point Called',
        content: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'application/json': {
            schema: {
              type: 'object',
              title: 'TestResponse',
              properties: {
                message: {type: 'string'},
                date: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  testDecorator() {
    return {
      message: 'You have successfully called test decorator end point',
      date: new Date(),
    };
  }
}
