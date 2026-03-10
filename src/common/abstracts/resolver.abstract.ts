import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from '../helpers/env.validation';
import { AppLogger } from '../logger/logger.service';
import { UtilService } from '../utils/util.service';
import { AbstractBase } from './base.abstract';

export abstract class AbstractResolver<S> extends AbstractBase {
  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,

    private readonly _service: S,
  ) {
    super(configService, utilService, appLogger);
  }

  protected get service(): S {
    return this._service;
  }
}
