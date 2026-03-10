import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTables1745221756250 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Authentication modules

    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT NOT NULL,
        email TEXT,
        address TEXT,
        birthday TEXT,
        refresh_token TEXT,
        avatar_id INTEGER,
        role_ids INTEGER[],
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        permission_ids INTEGER[],
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE permissions (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE user_role_relations (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE role_permission_relations (
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      )
    `);

    // Product modules

    await queryRunner.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        type TEXT NOT NULL,
        short_description TEXT,
        description TEXT,
        keywords TEXT[],
        thumbnail_id INTEGER,
        parent_id INTEGER,
        children_ids INTEGER[],
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE units (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        sku TEXT,
        type TEXT NOT NULL,
        features TEXT[],
        turnaround TEXT,
        short_description TEXT,
        description TEXT,
        status TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        average_rating INTEGER DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        thumbnail_id INTEGER,
        gallery_image_ids INTEGER[],
        attachment_ids INTEGER[],
        category_ids INTEGER[],
        base_unit_id INTEGER,
        attribute_ids INTEGER[],
        attribute_value_ids INTEGER[],
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_attributes (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_attribute_values (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        attribute_id INTEGER REFERENCES product_attributes(id) ON DELETE CASCADE,
        value TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_variants (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        sku TEXT,
        status TEXT NOT NULL,
        description TEXT,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        attribute_ids INTEGER[],
        attribute_value_ids INTEGER[],
        gallery_image_ids INTEGER[],
        base_unit_id INTEGER,
        conversion_unit_ids INTEGER[],
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_reviews (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        attachment_ids INTEGER[],
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_category_relations (
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, category_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_attribute_relations (
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        attribute_id INTEGER REFERENCES product_attributes(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, attribute_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_attribute_value_relations (
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        attribute_value_id INTEGER REFERENCES product_attribute_values(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, attribute_value_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_variant_attribute_relations (
        variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
        attribute_id INTEGER REFERENCES product_attributes(id) ON DELETE CASCADE,
        PRIMARY KEY (variant_id, attribute_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_variant_attribute_value_relations (
        variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
        attribute_value_id INTEGER REFERENCES product_attribute_values(id) ON DELETE CASCADE,
        PRIMARY KEY (variant_id, attribute_value_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE conversion_units (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
        unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
        conversion_rate INTEGER NOT NULL,
        regular_price INTEGER NOT NULL,
        sale_price INTEGER NOT NULL,
        price INTEGER NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Order modules

    await queryRunner.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        customer_id INTEGER,
        total_cost INTEGER DEFAULT 0,
        service_fee INTEGER DEFAULT 0,
        tax INTEGER DEFAULT 0,
        discount INTEGER DEFAULT 0,
        final_cost INTEGER DEFAULT 0,
        paid INTEGER DEFAULT 0,
        remaining INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        shipping_status TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        note TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE order_details (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        variant_id INTEGER NOT NULL,
        conversion_unit_id INTEGER NOT NULL,
        price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_cost INTEGER NOT NULL,
        service_fee INTEGER NOT NULL,
        tax INTEGER NOT NULL,
        discount INTEGER NOT NULL,
        final_cost INTEGER NOT NULL,
        note TEXT,
        status TEXT NOT NULL,
        shipping_status TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE order_shippings (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        order_detail_id INTEGER REFERENCES order_details(id) ON DELETE CASCADE,
        address_id INTEGER,
        to_name TEXT NOT NULL,
        to_phone TEXT NOT NULL,
        to_email TEXT,
        to_address TEXT NOT NULL,
        to_ward TEXT,
        to_district TEXT,
        to_province TEXT,
        to_country TEXT,
        to_postal_code TEXT,
        to_latitude FLOAT,
        to_longitude FLOAT,
        note TEXT,
        pickup_at TIMESTAMP,
        delivery_at TIMESTAMP,
        return_at TIMESTAMP,
        cancel_at TIMESTAMP,
        completed_at TIMESTAMP,
        estimated_delivery_at TIMESTAMP,
        status TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE order_histories (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        order_id INTEGER,
        order_detail_id INTEGER,
        status TEXT,
        shipping_status TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Other modules

    await queryRunner.query(`
      CREATE TABLE addresses (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT NOT NULL,
        ward TEXT,
        district TEXT,
        province TEXT,
        country TEXT,
        postal_code TEXT,
        latitude FLOAT,
        longitude FLOAT,
        is_default BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        customer_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL,
        attachment_ids INTEGER[],
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE blogs (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        content TEXT NOT NULL,
        thumbnail_id INTEGER,
        author_id INTEGER REFERENCES users(id),
        status TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        customer_id INTEGER,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        type TEXT NOT NULL,
        estimated_date TIMESTAMP,
        content TEXT NOT NULL,
        status TEXT NOT NULL,
        category_ids INTEGER[],
        product_ids INTEGER[],
        attachment_ids INTEGER[],
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // File upload modules

    await queryRunner.query(`
      CREATE TABLE file_uploads (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER,
        status TEXT NOT NULL,
        owner_by INTEGER,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER,
        deleted_at TIMESTAMP,
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS addresses');
    await queryRunner.query('DROP TABLE IF EXISTS appointments');
    await queryRunner.query('DROP TABLE IF EXISTS blogs');
    await queryRunner.query('DROP TABLE IF EXISTS bookings');
    await queryRunner.query('DROP TABLE IF EXISTS categories');
    await queryRunner.query('DROP TABLE IF EXISTS product_category_relations');
    await queryRunner.query('DROP TABLE IF EXISTS conversion_units');
    await queryRunner.query('DROP TABLE IF EXISTS file_uploads');
    await queryRunner.query('DROP TABLE IF EXISTS order_details');
    await queryRunner.query('DROP TABLE IF EXISTS order_histories');
    await queryRunner.query('DROP TABLE IF EXISTS order_shippings');
    await queryRunner.query('DROP TABLE IF EXISTS orders');
    await queryRunner.query('DROP TABLE IF EXISTS permissions');
    await queryRunner.query('DROP TABLE IF EXISTS product_attribute_values');
    await queryRunner.query('DROP TABLE IF EXISTS product_attribute_value_relations');
    await queryRunner.query('DROP TABLE IF EXISTS product_variant_attribute_value_relations');
    await queryRunner.query('DROP TABLE IF EXISTS product_attributes');
    await queryRunner.query('DROP TABLE IF EXISTS product_attribute_relations');
    await queryRunner.query('DROP TABLE IF EXISTS product_variant_attribute_relations');
    await queryRunner.query('DROP TABLE IF EXISTS product_favorites');
    await queryRunner.query('DROP TABLE IF EXISTS product_reviews');
    await queryRunner.query('DROP TABLE IF EXISTS product_variants');
    await queryRunner.query('DROP TABLE IF EXISTS products');
    await queryRunner.query('DROP TABLE IF EXISTS roles');
    await queryRunner.query('DROP TABLE IF EXISTS units');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}
