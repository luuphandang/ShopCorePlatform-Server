import { CoreContext } from '../contexts/core.context';
import { AbstractBase } from './base.abstract';

export abstract class AbstractResolver<S> extends AbstractBase {
  constructor(
    coreContext: CoreContext,
    private readonly _service: S,
  ) {
    super(coreContext);
  }

  protected get service(): S {
    return this._service;
  }
}
