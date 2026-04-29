import { ApolloServerPlugin } from '@apollo/server';

import { graphqlResolverDuration } from '@/modules/metrics/metrics.registry';

export const MetricsPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async executionDidStart() {
        return {
          willResolveField({ info }) {
            const start = process.hrtime.bigint();
            return (err) => {
              const duration = Number(process.hrtime.bigint() - start) / 1e9;
              graphqlResolverDuration
                .labels(info.parentType.name, info.fieldName, err ? 'error' : 'success')
                .observe(duration);
            };
          },
        };
      },
    };
  },
};
