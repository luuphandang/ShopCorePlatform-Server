import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CoreContext } from './core.context';

@Injectable()
export class RepositoryContext {
  constructor(
    readonly core: CoreContext,
    readonly dataSource: DataSource,
  ) {}
}
