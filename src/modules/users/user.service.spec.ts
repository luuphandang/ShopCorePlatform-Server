import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { AppLogger } from '@/common/logger/logger.service';
import { UtilService } from '@/common/utils/util.service';

import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let kafkaService: jest.Mocked<KafkaService>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      executeInTransaction: jest.fn(),
    };

    const mockKafkaService = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
        {
          provide: UtilService,
          useValue: {
            kafkaTopic: jest.fn().mockReturnValue('test-topic'),
          },
        },
        {
          provide: AppLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
        {
          provide: ModuleRef,
          useValue: {
            get: jest.fn().mockImplementation((service) => {
              if (service.name === 'RoleService') {
                return {
                  getMany: jest.fn().mockResolvedValue([]),
                };
              }
              if (service.name === 'AuthService') {
                return {
                  validateUser: jest.fn().mockResolvedValue(true),
                };
              }
              return {};
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    kafkaService = module.get(KafkaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create user', () => {
    it('create user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        phone: '0909090909',
        last_name: 'Test',
        first_name: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      };

      userRepository.executeInTransaction.mockImplementation(async (callback) => {
        return callback();
      });
      userRepository.create.mockResolvedValue(mockUser as unknown as User);

      const user = await service.createUser({
        email: 'test@test.com',
        password: '123456',
        phone: '0909090909',
        last_name: 'Test',
        first_name: 'Test',
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('test@test.com');
      expect(userRepository.create).toHaveBeenCalled();
      expect(kafkaService.publish).toHaveBeenCalled();
    });

    describe('create user failed', () => {
      it('throw an error if email is already taken', async () => {
        userRepository.executeInTransaction.mockImplementation(async (_callback) => {
          throw new Error('Email already exists');
        });

        await expect(
          service.createUser({
            email: 'test@test.com',
            password: '123456',
            phone: '0909090909',
            last_name: 'Test',
            first_name: 'Test',
          }),
        ).rejects.toThrow('Email already exists');
      });

      it('throw an error if email is already taken', async () => {
        userRepository.executeInTransaction.mockImplementation(async (_callback) => {
          throw new Error('Email already exists');
        });

        await expect(
          service.createUser({
            email: 'test@test.com',
            password: '123456',
            phone: '0909090909',
            last_name: 'Test',
            first_name: 'Test',
          }),
        ).rejects.toThrow('Email already exists');
      });
    });
  });
});
