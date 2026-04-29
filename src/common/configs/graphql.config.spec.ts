import { ConfigService } from '@nestjs/config';

import { MetricsPlugin } from '@/common/graphql/metrics.plugin';
import { RequestIdPlugin } from '@/common/graphql/request-id.plugin';
import { SecurityHeadersPlugin } from '@/common/security/security-headers.plugin';

import { DataloaderService } from '../dataloader/dataloader.service';
import { EnvironmentVariables } from '../helpers/env.validation';
import { graphqlConfig } from './graphql.config';

describe('graphqlConfig plugin composition', () => {
  const buildConfig = async () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'GRAPHQL_MAX_DEPTH') return 7;
        if (key === 'GRAPHQL_MAX_COMPLEXITY') return 1000;
        if (key === 'GRAPHQL_PLAYGROUND') return false;
        if (key === 'NODE_ENV') return 'test';
        return undefined;
      }),
    } as unknown as ConfigService<EnvironmentVariables>;

    const dataloaderService = {
      createLoaders: jest.fn(() => ({})),
    } as unknown as DataloaderService;

    return graphqlConfig(dataloaderService, configService);
  };

  it('registers SecurityHeadersPlugin, MetricsPlugin and RequestIdPlugin', async () => {
    const config = await buildConfig();

    expect(config.plugins).toBeDefined();
    expect(config.plugins).toEqual(
      expect.arrayContaining([SecurityHeadersPlugin, MetricsPlugin, RequestIdPlugin]),
    );
    expect(config.plugins).toHaveLength(3);
  });
});
