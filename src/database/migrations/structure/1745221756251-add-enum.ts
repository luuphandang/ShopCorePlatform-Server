import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnum1745221756251 implements MigrationInterface {
  name = 'AddEnum1745221756251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE category_type AS ENUM (
        'SERVICE',
        'PRODUCT',
        'BLOG'
      );

      CREATE TYPE order_status AS ENUM (
        'CART',
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'ON_HOLD',
        'SHIPPED',
        'COMPLETED',
        'CANCELLED',
        'REFUNDED',
        'FAILED',
        'PARTIAL_REFUNDED',
        'COD_PENDING',
        'COD_COLLECTED',
        'COD_FAILED'
      );

      CREATE TYPE shipping_status AS ENUM (
        'NOT_REQUIRED',
        'PENDING',
        'CONFIRMED',
        'SHIPPED',
        'IN_TRANSIT',
        'DELIVERED',
        'RETURNED',
        'LOST'
      );

      CREATE TYPE payment_status AS ENUM (
        'UNPAID',
        'PARTIAL_PAID',
        'INSTALLMENT_ONGOING',
        'PAID',
        'FAILED'
      );

      CREATE TYPE file_type AS ENUM (
        'IMAGE',
        'WORD',
        'EXCEL',
        'PDF',
        'OTHER'
      );

      CREATE TYPE file_status AS ENUM (
        'ACTIVATED',
        'DEACTIVATED'
      );

      CREATE TYPE product_status AS ENUM (
        'ACTIVATED',
        'DEACTIVATED'
      );

      CREATE TYPE product_type AS ENUM (
        'PRODUCT',
        'SERVICE'
      );

      CREATE TYPE variant_status AS ENUM (
        'ACTIVATED',
        'DEACTIVATED'
      );

      CREATE TYPE booking_type AS ENUM (
        'SERVICE',
        'PRODUCT'
      );

      CREATE TYPE booking_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'CANCELLED',
        'COMPLETED',
        'RESCHEDULED'
      );

      CREATE TYPE appointment_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'CANCELLED',
        'COMPLETED',
        'RESCHEDULED'
      );
    `);

    // Alter categories table
    await queryRunner.query(`
      ALTER TABLE categories 
      ALTER COLUMN type TYPE category_type 
      USING type::category_type;
    `);

    // Alter orders table
    await queryRunner.query(`
      ALTER TABLE orders 
      ALTER COLUMN status TYPE order_status 
      USING status::order_status;

      ALTER TABLE orders 
      ALTER COLUMN shipping_status TYPE shipping_status 
      USING shipping_status::shipping_status;

      ALTER TABLE orders 
      ALTER COLUMN payment_status TYPE payment_status 
      USING payment_status::payment_status;
    `);

    // Alter order_details table
    await queryRunner.query(`
      ALTER TABLE order_details 
      ALTER COLUMN status TYPE order_status 
      USING status::order_status;

      ALTER TABLE order_details 
      ALTER COLUMN shipping_status TYPE shipping_status 
      USING shipping_status::shipping_status; 

      ALTER TABLE order_details 
      ALTER COLUMN payment_status TYPE payment_status 
      USING payment_status::payment_status;
    `);

    // Alter order_shippings table
    await queryRunner.query(`
      ALTER TABLE order_shippings 
      ALTER COLUMN status TYPE shipping_status 
      USING status::shipping_status;
    `);

    // Alter file_uploads table
    await queryRunner.query(`
      ALTER TABLE file_uploads 
      ALTER COLUMN type TYPE file_type 
      USING type::file_type;

      ALTER TABLE file_uploads 
      ALTER COLUMN status TYPE file_status 
      USING status::file_status;
    `);

    // Alter products table
    await queryRunner.query(`
      ALTER TABLE products 
      ALTER COLUMN status TYPE product_status 
      USING status::product_status;

      ALTER TABLE products 
      ALTER COLUMN type TYPE product_type 
      USING type::product_type;
    `);

    // Alter bookings table
    await queryRunner.query(`
      ALTER TABLE bookings 
      ALTER COLUMN type TYPE booking_type 
      USING type::booking_type;

      ALTER TABLE bookings 
      ALTER COLUMN status TYPE booking_status 
      USING status::booking_status;
    `);

    // Alter appointments table
    await queryRunner.query(`
      ALTER TABLE appointments 
      ALTER COLUMN status TYPE appointment_status 
      USING status::appointment_status;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop ENUM types
    await queryRunner.query(`
      DROP TYPE IF EXISTS category_type;
      DROP TYPE IF EXISTS order_status;
      DROP TYPE IF EXISTS shipping_status;
      DROP TYPE IF EXISTS payment_status;
      DROP TYPE IF EXISTS file_type;
      DROP TYPE IF EXISTS file_status;
      DROP TYPE IF EXISTS product_status;
      DROP TYPE IF EXISTS product_type;
      DROP TYPE IF EXISTS booking_type;
      DROP TYPE IF EXISTS booking_status;
      DROP TYPE IF EXISTS appointment_status;
    `);
  }
}
