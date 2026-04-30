import { Test, TestingModule } from '@nestjs/testing';

import { ServiceContext } from '@/common/contexts/service.context';
import {
  createMockServiceContext,
  MockServiceContextOverrides,
} from '@/common/testing/mock-context';

import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      executeInTransaction: jest.fn(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      getPagination: jest.fn().mockResolvedValue({ count: 0, data: [] }),
      update: jest.fn(),
    };

    const moduleRefLookups: MockServiceContextOverrides['moduleRefLookups'] = {
      RoleService: { getMany: jest.fn().mockResolvedValue([]) },
      AuthService: { validateUser: jest.fn().mockResolvedValue(true) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: ServiceContext, useValue: createMockServiceContext({ moduleRefLookups }) },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('creates a user when input is valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        phone: '0909090909',
        last_name: 'Test',
        first_name: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      };

      userRepository.executeInTransaction.mockImplementation(
        async (callback: () => Promise<unknown>) => callback(),
      );
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
    });

    it('rethrows when the transaction fails (eg duplicate email)', async () => {
      userRepository.executeInTransaction.mockImplementation(async () => {
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
