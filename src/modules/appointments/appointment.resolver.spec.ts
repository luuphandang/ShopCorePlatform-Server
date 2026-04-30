import { Test, TestingModule } from '@nestjs/testing';

import { mockCoreContextProvider } from '@/common/testing/mock-context';

import { AppointmentResolver } from './appointment.resolver';
import { AppointmentService } from './appointment.service';

describe('AppointmentResolver', () => {
  let resolver: AppointmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentResolver,
        mockCoreContextProvider(),
        { provide: AppointmentService, useValue: {} },
      ],
    }).compile();

    resolver = module.get<AppointmentResolver>(AppointmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
