import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AbstractService, IServiceOptions } from '@/common/abstracts/service.abstract';
import { CustomBadRequestError } from '@/common/exceptions/bad-request.exception';
import { CustomNotFoundError } from '@/common/exceptions/not-found.exception';
import { EnvironmentVariables } from '@/common/helpers/env.validation';
import { AppLogger } from '@/common/logger/logger.service';
import { RabbitMQService } from '@/common/rabbitmq/rabbitmq.service';
import { UtilService } from '@/common/utils/util.service';

import { AuthService } from '../auth/auth.service';
import { RoleService } from '../roles/role.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { UserRepository } from './user.repository';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class UserService extends AbstractService<User, UserRepository> {
  private roleService: RoleService;
  private authService: AuthService;

  constructor(
    configService: ConfigService<EnvironmentVariables>,
    utilService: UtilService,
    appLogger: AppLogger,
    rabbitMQService: RabbitMQService,
    redisService: RedisService,
    moduleRef: ModuleRef,

    private readonly userRepository: UserRepository,
  ) {
    super(configService, utilService, appLogger, rabbitMQService, redisService, moduleRef, userRepository);
  }

  protected initializeDependencies() {
    this.roleService = this.moduleRef.get(RoleService, { strict: false });
    this.authService = this.moduleRef.get(AuthService, { strict: false });
  }

  async createUser(data: CreateUserInput, options: IServiceOptions<User> = {}): Promise<User> {
    try {
      return await this.executeInTransaction(async () => {
        if (Array.isArray(data.roles)) {
          const roles = await this.roleService.getMany({
            where: { id: { $in: data.roles.map((elm) => elm.id) } },
          });

          Object.assign(data, { role_ids: roles.map((elm) => elm.id), roles });
        }

        return await this.create(data, options);
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:createUser`);
      throw error;
    }
  }

  async updateUser(
    id: number,
    data: UpdateUserInput & { refresh_token?: string },
    options: IServiceOptions<User> = {},
  ): Promise<User | null> {
    try {
      return await this.executeInTransaction(async () => {
        if (!options.model) {
          options.model = await this.userRepository.getOne({
            where: { id },
            relations: {
              roles: true,
            },
          });
        }
        if (!options.model || options.model.id !== id)
          throw new CustomNotFoundError('Không tìm thấy dữ liệu.');

        if (data.password) {
          const isValid = await this.authService.validateUser({
            phone: options.model.phone,
            password: data.password,
          });
          if (!isValid) throw new CustomBadRequestError('Thông tin tài khoản không chính xác.');

          if (data.new_password !== data.confirm_password) {
            throw new CustomBadRequestError('Mật khẩu không khớp.');
          }

          data.password = data.new_password;
        }

        if (Array.isArray(data.roles)) {
          const roles = await this.roleService.getMany({
            where: { id: { $in: data.roles.map((elm) => elm.id) } },
          });

          Object.assign(data, { role_ids: roles.map((elm) => elm.id), roles });
        }

        Object.assign(options.model, data);

        return await this.update(id, options.model, options);
      });
    } catch (error) {
      this.logger.error(error, `${this.className}:updateUser`);
      throw error;
    }
  }
}
