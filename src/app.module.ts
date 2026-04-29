import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { graphqlConfig } from './common/configs/graphql.config';
import { rabbitmqConfig } from './common/configs/rabbitmq.config';
import { typeOrmConfig } from './common/configs/typeorm.config';
import { ContextModule } from './common/contexts/context.module';
import { DataloaderModule } from './common/dataloader/dataloader.module';
import { DataloaderService } from './common/dataloader/dataloader.service';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { getEnvPath } from './common/helpers/env.helper';
import { EnvironmentVariables, envValidation } from './common/helpers/env.validation';
import { LoggerModule } from './common/logger/logger.module';
import { RefreshTokenMiddleware } from './common/middlewares/refresh-token.middleware';
import { RabbitMQModule } from './common/rabbitmq/rabbitmq.module';
import { RedisModule } from './common/redis/redis.module';
import { SecurityModule } from './common/security/security.module';
// Importing all feature modules
import { AddressModule } from './modules/addresses/address.module';
import { AppointmentModule } from './modules/appointments/appointment.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blogs/blog.module';
import { BookingModule } from './modules/bookings/booking.module';
import { CartModule } from './modules/carts/cart.module';
import { CategoryModule } from './modules/categories/category.module';
import { ConversionUnitModule } from './modules/conversion-units/conversion-unit.module';
import { FileUploadModule } from './modules/file-uploads/file-upload.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { OrderDetailModule } from './modules/order-details/order-detail.module';
import { OrderHistoryModule } from './modules/order-histories/order-history.module';
import { OrderShippingModule } from './modules/order-shippings/order-shipping.module';
import { OrderModule } from './modules/orders/order.module';
import { PermissionModule } from './modules/permissions/permission.module';
import { ProductAttributeValueModule } from './modules/product-attribute-values/product-attribute-value.module';
import { ProductAttributeModule } from './modules/product-attributes/product-attribute.module';
import { ProductReviewModule } from './modules/product-reviews/product-review.module';
import { ProductVariantModule } from './modules/product-variants/product-variant.module';
import { ProductModule } from './modules/products/product.module';
import { RoleModule } from './modules/roles/role.module';
import { UnitModule } from './modules/units/unit.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvPath(`${__dirname}/..`),
      isGlobal: true,
      validate: envValidation,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        throttlers: [
          {
            ttl: configService.get('THROTTLE_TTL', { infer: true }) ?? 60000,
            limit: configService.get('THROTTLE_LIMIT', { infer: true }) ?? 60,
          },
        ],
      }),
    }),
    DiscoveryModule,
    RabbitMQModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvironmentVariables>) =>
        rabbitmqConfig(configService),
    }),
    RedisModule.forRootAsync({ isGlobal: true }),
    SecurityModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule],
      inject: [DataloaderService, ConfigService],
      useFactory: async (
        dataloaderService: DataloaderService,
        configService: ConfigService<EnvironmentVariables>,
      ) => graphqlConfig(dataloaderService, configService),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvironmentVariables>) =>
        typeOrmConfig(configService),
    }),
    LoggerModule,
    ContextModule,
    AuthModule,
    AddressModule,
    AppointmentModule,
    BlogModule,
    BookingModule,
    CartModule,
    CategoryModule,
    ConversionUnitModule,
    FileUploadModule,
    MetricsModule,
    OrderDetailModule,
    OrderHistoryModule,
    OrderShippingModule,
    OrderModule,
    PermissionModule,
    ProductAttributeValueModule,
    ProductAttributeModule,
    ProductReviewModule,
    ProductVariantModule,
    ProductModule,
    RoleModule,
    UnitModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RefreshTokenMiddleware).forRoutes('*');
  }
}
