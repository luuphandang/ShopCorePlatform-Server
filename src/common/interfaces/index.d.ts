import { IDataloader } from '@/common/dataloader/dataloader.interface';
import { MetadataResponse } from '@/common/graphql/metadata.response';
import { EnvironmentVariables } from '@/common/helpers/env.validation';

declare global {
  interface IGraphQLContext {
    loaders: IDataloader;
  }

  interface IKafkaResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }

  interface IRabbitMQResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }

  interface IPaginationResponse<T> {
    metadata?: MetadataResponse;
    data?: T[];
  }

  interface ILogger {
    debug(message: string, context?: string): void;
    error(message: string, context?: string): void;
    log(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    warn(message: string, context?: string): void;
  }

  interface IConfig {
    getString(key: keyof EnvironmentVariables): string;
    getNumber(key: keyof EnvironmentVariables): number;
    getOptionalString(key: keyof EnvironmentVariables): string | undefined;
  }
}
