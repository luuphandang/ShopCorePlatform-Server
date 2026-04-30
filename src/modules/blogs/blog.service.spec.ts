import { Test, TestingModule } from '@nestjs/testing';

import { mockServiceContextProvider } from '@/common/testing/mock-context';

import { BlogRepository } from './blog.repository';
import { BlogService } from './blog.service';

describe('BlogService', () => {
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        mockServiceContextProvider(),
        { provide: BlogRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
