import { DeepPartial, FindOptionsWhere } from 'typeorm';

import { ServiceContext } from '../contexts/service.context';
import { CustomBadRequestError } from '../exceptions/bad-request.exception';
import { AbstractEntity } from './entity.abstract';
import { AbstractRepository } from './repository.abstract';
import { AbstractService, IServiceOptions } from './service.abstract';

export type IStatusTransitionMap<S extends string> = Partial<Record<S, S[]>>;

export interface IStatusChangeOptions<T> extends IServiceOptions<T> {
  skipValidation?: boolean;
}

export abstract class AbstractStatusService<
  T extends AbstractEntity,
  R extends AbstractRepository<T>,
  S extends string = string,
> extends AbstractService<T, R> {
  protected abstract readonly statusTransitions: IStatusTransitionMap<S>;

  constructor(serviceContext: ServiceContext, repository: R) {
    super(serviceContext, repository);
  }

  public async changeStatus(
    id: number,
    newStatus: S,
    options: IStatusChangeOptions<T> = {},
  ): Promise<T | null> {
    try {
      if (!options.model) {
        options.model = await this.getOne({
          where: { id } as unknown as FindOptionsWhere<T>,
        });
      }

      const currentStatus = (options.model as T & { status: S }).status;

      if (!options.skipValidation) {
        this.validateStatusTransition(currentStatus, newStatus);
      }

      await this.beforeStatusChange(options.model, currentStatus, newStatus, options);

      const result = await this.update(
        id,
        { status: newStatus } as unknown as DeepPartial<T>,
        options,
      );

      await this.afterStatusChange(result, currentStatus, newStatus, options);

      return result;
    } catch (error) {
      this.logger.error(error, `${this.className}:changeStatus`);
      throw error;
    }
  }

  protected validateStatusTransition(currentStatus: S, newStatus: S): void {
    const allowedStatuses = this.statusTransitions[currentStatus];

    if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
      throw new CustomBadRequestError(
        `Không thể chuyển trạng thái từ "${currentStatus}" sang "${newStatus}".`,
      );
    }
  }

  protected async beforeStatusChange(
    _model: T,
    _currentStatus: S,
    _newStatus: S,
    _options: IStatusChangeOptions<T>,
  ): Promise<void> {}

  protected async afterStatusChange(
    _model: T,
    _currentStatus: S,
    _newStatus: S,
    _options: IStatusChangeOptions<T>,
  ): Promise<void> {}
}
