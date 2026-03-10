import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from '../helpers/env.validation';
import { AppLogger } from '../logger/logger.service';
import { UtilService } from '../utils/util.service';

@Injectable()
export class CoreContext {
  constructor(
    readonly configService: ConfigService<EnvironmentVariables>,
    readonly utilService: UtilService,
    readonly appLogger: AppLogger,
  ) {}
}
