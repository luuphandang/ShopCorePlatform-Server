import { ApolloDriverConfig } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createComplexityRule, simpleEstimator } from 'graphql-query-complexity';
import { JSONResolver } from 'graphql-scalars';
import { join } from 'path';

import { DataloaderService } from '../dataloader/dataloader.service';
import { ERROR_CODES } from '../exceptions/constant.exception';
import { MetricsPlugin } from '../graphql/metrics.plugin';
import { EnvironmentVariables } from '../helpers/env.validation';
import { SecurityHeadersPlugin } from '../security/security-headers.plugin';

const logger = new Logger('GraphQLSecurity');

interface IGraphQLFormattedError extends GraphQLFormattedError {
  status: unknown;
}
export const graphqlConfig = async (
  dataloaderService: DataloaderService,
  configService: ConfigService<EnvironmentVariables>,
): Promise<ApolloDriverConfig> => {
  const maxDepth = configService.get<number>('GRAPHQL_MAX_DEPTH') || 7;
  const maxComplexity = configService.get<number>('GRAPHQL_MAX_COMPLEXITY') || 1000;
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    resolvers: { JSON: JSONResolver },
    playground: configService.get<boolean>('GRAPHQL_PLAYGROUND'),
    introspection: !isProduction,
    sortSchema: true,
    autoSchemaFile: join(process.cwd(), `src/schema.gql`),
    buildSchemaOptions: {
      orphanedTypes: [],
    },
    validationRules: [
      depthLimit(maxDepth, {}, (depths) => {
        const queryDepth = Object.values(depths).reduce(
          (max: number, depth: number) => Math.max(max, depth),
          0,
        ) as number;
        if (queryDepth >= maxDepth) {
          logger.warn(
            `Query rejected: depth ${queryDepth} exceeds maximum allowed depth of ${maxDepth}`,
          );
        }
      }),
      createComplexityRule({
        maximumComplexity: maxComplexity,
        estimators: [simpleEstimator({ defaultComplexity: 1 })],
        onComplete: (complexity: number) => {
          if (complexity >= maxComplexity) {
            logger.warn(
              `Query rejected: complexity ${complexity} exceeds maximum allowed complexity of ${maxComplexity}`,
            );
          }
        },
      }),
    ],
    context: ({ req, res }) => ({
      loaders: dataloaderService.createLoaders(),
      req,
      res,
    }),
    plugins: [SecurityHeadersPlugin, MetricsPlugin],
    formatError: (error: GraphQLError): IGraphQLFormattedError => {
      const extensions = error?.extensions;
      return {
        status: extensions?.code || ERROR_CODES.UNKNOWN_ERROR,
        message: error.message,
        path: error.path || null,
        extensions: {
          code: extensions?.code,
        },
      };
    },
  };
};
