import {
  Constructor,
  inject,
  MetadataInspector,
  Provider,
} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {RateLimitMetadata} from '../types';
import {RATELIMIT_METADATA_ACCESSOR} from '../keys';

export class RateLimitMetadataProvider
  implements Provider<RateLimitMetadata | undefined>
{
  constructor(
    @inject(CoreBindings.CONTROLLER_CLASS, {optional: true})
    private readonly controllerClass: Constructor<{}>,
    @inject(CoreBindings.CONTROLLER_METHOD_NAME, {optional: true})
    private readonly methodName: string,
  ) {}

  value(): RateLimitMetadata | undefined {
    if (!this.controllerClass || !this.methodName) return;
    return getRateLimitMetadata(this.controllerClass, this.methodName);
  }
}

export function getRateLimitMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): RateLimitMetadata | undefined {
  return MetadataInspector.getMethodMetadata<RateLimitMetadata>(
    RATELIMIT_METADATA_ACCESSOR,
    controllerClass.prototype,
    methodName,
  );
}
