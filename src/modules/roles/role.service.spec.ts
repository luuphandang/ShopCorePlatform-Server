import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        mockServiceContextProvider(),
        { provide: RoleRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
