import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum NODE_ENVIRONMENT {
  development,
  production,
  test,
}

export class EnvironmentVariables {
  @IsEnum(NODE_ENVIRONMENT)
  NODE_ENV: keyof typeof NODE_ENVIRONMENT;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  CROSS_ORIGIN: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_URI: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_SCHEMA: string;

  @IsString()
  @IsNotEmpty()
  DB_SYNCHRONIZE: string;

  @IsString()
  @IsNotEmpty()
  DB_LOGGING: string;

  @IsString()
  @IsNotEmpty()
  DB_MIGRATIONS_RUN: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  DEFAULT_PAGE: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  DEFAULT_PAGE_SIZE: number;

  @IsString()
  @IsNotEmpty()
  GRAPHQL_PLAYGROUND: string;

  @IsString()
  @IsOptional()
  AWS_S3_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  AWS_S3_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  AWS_S3_REGION?: string;

  @IsString()
  @IsOptional()
  AWS_S3_BUCKET_NAME?: string;

  @IsString()
  @IsOptional()
  AWS_S3_ENDPOINT?: string;

  @IsNumber()
  @Min(0)
  @Max(60 * 60 * 24)
  @IsOptional()
  SIGNED_URL_EXPIRES_IN?: number;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_PUBLIC_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_PUBLIC_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_PRIVATE_KEY: string;

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  REDIS_TTL?: number;

  @IsString()
  @IsOptional()
  REDIS_KEY_PREFIX?: string;

  @IsString()
  @IsOptional()
  LOG_LEVEL?: string;

  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  BCRYPT_HASH_ROUNDS?: number;

  @IsNumber()
  @Min(1000)
  @IsOptional()
  THROTTLE_TTL?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  THROTTLE_LIMIT?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  GRAPHQL_MAX_DEPTH?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  GRAPHQL_MAX_COMPLEXITY?: number;

  @IsString()
  @IsOptional()
  METRICS_USER?: string;

  @IsString()
  @IsOptional()
  METRICS_PASSWORD?: string;
}

export function envValidation(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
