import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { CustomNotFoundError } from '@/common/exceptions/not-found.exception';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { PermissionService } from '../permissions/permission.service';
import { Role } from './entities/role.entity';
import { CreateRoleInput } from './inputs/create-role.input';
import { UpdateRoleInput } from './inputs/update-role.input';
import { RoleRepository } from './role.repository';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class RoleService extends AbstractService<Role, RoleRepository> {
  private permissionService: PermissionService;

  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly roleRepository: RoleRepository,
  ) {
    super(configService, utilService, appLogger, rabbitMQService, redisService, moduleRef, roleRepository);
  }
  protected initializeDependencies() {
    this.permissionService = this.moduleRef.get(PermissionService, { strict: false });
  }

  async createRole(data: CreateRoleInput, options: IServiceOptions<Role> = {}): Promise<Role> {
    try {
      return await this.executeInTransaction(async () => {
        const permissions = await this.permissionService.getMany({
          where: { id: { $in: data.permissions.map((elm) => elm.id) } },
        });

        return await this.create(
          {
            ...data,
            permission_ids: permissions.map((elm) => elm.id),
            permissions,
          },
          options,
        );
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createRole`);
      throw error;
    }
  }

  async updateRole(
    id: number,
    data: UpdateRoleInput,
    options: IServiceOptions<Role> = {},
  ): Promise<Role | null> {
    try {
      return await this.executeInTransaction(async () => {
        if (!options.model) {
          options.model = await this.roleRepository.getOne({
            where: { id },
            relations: {
              permissions: true,
            },
          });
        }
        if (!options.model || options.model.id !== id)
          throw new CustomNotFoundError('Không tìm thấy dữ liệu.');

        const permissions = await this.permissionService.getMany({
          where: { id: { $in: data.permissions.map((elm) => elm.id) } },
        });

        Object.assign(options.model, data, {
          permission_ids: permissions.map((elm) => elm.id),
          permissions,
        });

        return await this.update(id, options.model, options);
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:updateRole`);
      throw error;
    }
  }
}
