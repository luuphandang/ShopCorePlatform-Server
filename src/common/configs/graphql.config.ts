import { ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { JSONResolver } from 'graphql-scalars';
import { join } from 'path';

import { DataloaderService } from '../dataloader/dataloader.service';
import { ERROR_CODES } from '../exceptions/constant.exception';
import { EnvironmentVariables } from '../helpers/env.validation';
import { SecurityHeadersPlugin } from '../security/security-headers.plugin';

interface IGraphQLFormattedError extends GraphQLFormattedError {
  status: unknown;
}
export const graphqlConfig = async (
  dataloaderService: DataloaderService,
  configService: ConfigService<EnvironmentVariables>,
): Promise<ApolloDriverConfig> => {
  return {
    resolvers: { JSON: JSONResolver },
    playground: configService.get<boolean>('GRAPHQL_PLAYGROUND'),
    sortSchema: true,
    autoSchemaFile: join(process.cwd(), `src/schema.gql`),
    buildSchemaOptions: {
      orphanedTypes: [],
    },
    context: ({ req, res }) => ({
      loaders: dataloaderService.createLoaders(),
      req,
      res,
    }),
    plugins: [SecurityHeadersPlugin],
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
