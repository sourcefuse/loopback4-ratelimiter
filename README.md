# loopback4-ratelimiter

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

A simple loopback-next extension for rate limiting in loopback applications. This extension uses [express-rate-limit](https://github.com/nfriedly/express-rate-limit) under the hood with redis, memcache and mongodDB used as store for rate limiting key storage using [rate-limit-redis](https://github.com/wyattjoh/rate-limit-redis), [rate-limit-memcached](https://github.com/linyows/rate-limit-memcached) and [rate-limit-mongo](https://github.com/2do2go/rate-limit-mongo)

## Install

```sh
npm install loopback4-ratelimiter
```

## Usage

In order to use this component into your LoopBack application, please follow below steps.

- Add component to application.

```ts
this.component(RateLimiterComponent);
```

- Minimum configuration required for this component to work is the datasource name. Please provide it as below.

For redis datasource

```ts
this.bind(RateLimitSecurityBindings.CONFIG).to({
  name: 'redis',
  type:'RedisStore';
});
```

For memcache datasource

```ts
this.bind(RateLimitSecurityBindings.CONFIG).to({
  name: 'memcache',
  type:'MemcachedStore';
});
```

For mongoDB datasource

```ts
this.bind(RateLimitSecurityBindings.CONFIG).to({
  name: 'mongo',
  type:'MongoStore';
  uri: 'mongodb://127.0.0.1:27017/test_db',
  collectionName: 'expressRateRecords'
});
```

- By default, ratelimiter will be initialized with default options as mentioned [here](https://github.com/nfriedly/express-rate-limit#configuration-options). However, you can override any of the options using the Config Binding. Below is an example of how to do it with the redis datasource, you can also do it with other two datasources similarly.

```ts
const rateLimitKeyGen = (req: Request) => {
  const token =
    (req.headers &&
      req.headers.authorization &&
      req.headers.authorization.replace(/bearer /i, '')) ||
    '';
  return token;
};

......


this.bind(RateLimitSecurityBindings.CONFIG).to({
  name: 'redis',
  type: 'RedisStore',
  max: 60,
  keyGenerator: rateLimitKeyGen,
});
```

- The component exposes a sequence action which can be added to your server sequence class. Adding this will trigger ratelimiter middleware for all the requests passing through.

```ts
export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(RateLimitSecurityBindings.RATELIMIT_SECURITY_ACTION)
    protected rateLimitAction: RateLimitAction,
  ) {}

  async handle(context: RequestContext) {
    const requestTime = Date.now();
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      // rate limit Action here
      await this.rateLimitAction(request, response);

      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      ...
    } finally {
      ...
    }
  }
}
```

- This component also exposes a method decorator for cases where you want tp specify different rate limiting options at API method level. For example, you want to keep hard rate limit for unauthorized API requests and want to keep it softer for other API requests. In this case, the global config will be overwritten by the method decoration. Refer below.

```ts
const rateLimitKeyGen = (req: Request) => {
  const token =
    (req.headers &&
      req.headers.authorization &&
      req.headers.authorization.replace(/bearer /i, '')) ||
    '';
  return token;
};

.....

@ratelimit(true, {
  max: 60,
  keyGenerator: rateLimitKeyGen,
})
@patch(`/auth/change-password`, {
  responses: {
    [STATUS_CODE.OK]: {
      description: 'If User password successfully changed.',
    },
    ...ErrorCodes,
  },
  security: [
    {
      [STRATEGY.BEARER]: [],
    },
  ],
})
async resetPassword(
  @requestBody({
    content: {
      [CONTENT_TYPE.JSON]: {
        schema: getModelSchemaRef(ResetPassword, {partial: true}),
      },
    },
  })
  req: ResetPassword,
  @param.header.string('Authorization') auth: string,
): Promise<User> {
  return this.authService.changepassword(req, auth);
}
```

- You can also disable rate limiting for specific API methods using the decorator like below.

```ts
@ratelimit(false)
@authenticate(STRATEGY.BEARER)
@authorize(['*'])
@get('/auth/me', {
  description: ' To get the user details',
  security: [
    {
      [STRATEGY.BEARER]: [],
    },
  ],
  responses: {
    [STATUS_CODE.OK]: {
      description: 'User Object',
      content: {
        [CONTENT_TYPE.JSON]: AuthUser,
      },
    },
    ...ErrorCodes,
  },
})
async userDetails(
  @inject(RestBindings.Http.REQUEST) req: Request,
): Promise<AuthUser> {
  return this.authService.getme(req.headers.authorization);
}
```

## Feedback

If you've noticed a bug or have a question or have a feature request, [search the issue tracker](https://github.com/sourcefuse/loopback4-ratelimiter/issues) to see if someone else in the community has already created a ticket.
If not, go ahead and [make one](https://github.com/sourcefuse/loopback4-ratelimiter/issues/new/choose)!
All feature requests are welcome. Implementation time may vary. Feel free to contribute the same, if you can.
If you think this extension is useful, please [star](https://help.github.com/en/articles/about-stars) it. Appreciation really helps in keeping this project alive.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/sourcefuse/loopback4-ratelimiter/blob/master/.github/CONTRIBUTING.md) for details on the process for submitting pull requests to us.

## Code of conduct

Code of conduct guidelines [here](https://github.com/sourcefuse/loopback4-ratelimiter/blob/master/.github/CODE_OF_CONDUCT.md).

## License

[MIT](https://github.com/sourcefuse/loopback4-ratelimiter/blob/master/LICENSE)
