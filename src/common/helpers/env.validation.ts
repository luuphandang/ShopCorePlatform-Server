import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

export type NodeEnv = 'development' | 'staging' | 'production' | 'test';

const NODE_ENV_VALUES: NodeEnv[] = ['development', 'staging', 'production', 'test'];

const isProd = (env: EnvironmentVariables): boolean => env.NODE_ENV === 'production';

const COOKIE_DOMAIN_PROD_REGEX = /^\.[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

export class EnvironmentVariables {
  @IsEnum(NODE_ENV_VALUES, {
    message: `NODE_ENV must be one of: ${NODE_ENV_VALUES.join(', ')}`,
  })
  NODE_ENV: NodeEnv;

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

  @ValidateIf(isProd)
  @IsString()
  @IsNotEmpty({ message: 'DB_PASSWORD is required when NODE_ENV=production' })
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

  @ValidateIf(isProd)
  @IsString()
  @IsNotEmpty({ message: 'AWS_S3_REGION is required when NODE_ENV=production' })
  AWS_S3_REGION?: string;

  @ValidateIf(isProd)
  @IsString()
  @IsNotEmpty({ message: 'AWS_S3_BUCKET_NAME is required when NODE_ENV=production' })
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

  @ValidateIf(isProd)
  @IsString()
  @IsNotEmpty({ message: 'COOKIE_DOMAIN is required when NODE_ENV=production' })
  @Matches(COOKIE_DOMAIN_PROD_REGEX, {
    message:
      'COOKIE_DOMAIN must be a leading-dot domain like ".shopcore.example.com" when NODE_ENV=production (no localhost, no port)',
  })
  COOKIE_DOMAIN?: string;

  @ValidateIf(isProd)
  @IsString()
  @IsNotEmpty({ message: 'REDIS_HOST is required when NODE_ENV=production' })
  REDIS_HOST?: string;

  @ValidateIf(isProd)
  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsNotEmpty({ message: 'REDIS_PORT is required when NODE_ENV=production' })
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

  @ValidateIf(isProd)
  @IsString()
  @IsNotEmpty({ message: 'METRICS_USER is required when NODE_ENV=production' })
  METRICS_USER?: string;

  @ValidateIf(isProd)
  @IsString()
  @IsNotEmpty({ message: 'METRICS_PASSWORD is required when NODE_ENV=production' })
  METRICS_PASSWORD?: string;
}

export function envValidation(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  const messages = errors
    .map((error) => Object.values(error.constraints ?? {}).join('; '))
    .filter(Boolean);

  if (validatedConfig.NODE_ENV === 'production' && validatedConfig.DB_SYNCHRONIZE !== 'false') {
    messages.push(
      'DB_SYNCHRONIZE must be "false" when NODE_ENV=production (use migrations instead)',
    );
  }

  if (messages.length) {
    throw new Error(`Environment validation failed:\n  - ${messages.join('\n  - ')}`);
  }

  return validatedConfig;
}
