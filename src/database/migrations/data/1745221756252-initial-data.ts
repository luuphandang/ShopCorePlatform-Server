import { MigrationInterface, QueryRunner } from 'typeorm';

import { CODE_PREFIX } from '@/common/constants/code-prefix.constant';
import { PERMISSIONS } from '@/common/constants/permission.constant';
import { ECategoryType } from '@/common/enums/category.enum';
import { StringUtil } from '@/common/utils/string.util';

export class InitialData1745221756252 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert permissions
    await queryRunner.query(`
      INSERT INTO permissions (id, code, label, value, created_at, created_by, updated_at, updated_by)
      VALUES
        -- Full access
        (1, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Toàn quyền truy cập', '${PERMISSIONS.FULL_ACCESS}', NOW(), 1, NOW(), 1),

        -- Permission
        (2, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách quyền', '${PERMISSIONS.VIEW_PERMISSION}', NOW(), 1, NOW(), 1),

        -- Appointment
        (3, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách lịch liên hệ', '${PERMISSIONS.VIEW_APPOINTMENT}', NOW(), 1, NOW(), 1),
        (4, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo lịch liên hệ', '${PERMISSIONS.CREATE_APPOINTMENT}', NOW(), 1, NOW(), 1),
        (5, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật lịch liên hệ', '${PERMISSIONS.UPDATE_APPOINTMENT}', NOW(), 1, NOW(), 1),
        (6, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa lịch liên hệ', '${PERMISSIONS.DELETE_APPOINTMENT}', NOW(), 1, NOW(), 1),

        -- Attribute
        (7, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách thuộc tính', '${PERMISSIONS.VIEW_ATTRIBUTE}', NOW(), 1, NOW(), 1),
        (8, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo thuộc tính', '${PERMISSIONS.CREATE_ATTRIBUTE}', NOW(), 1, NOW(), 1),
        (9, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật thuộc tính', '${PERMISSIONS.UPDATE_ATTRIBUTE}', NOW(), 1, NOW(), 1),
        (10, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa thuộc tính', '${PERMISSIONS.DELETE_ATTRIBUTE}', NOW(), 1, NOW(), 1),

        -- Blog
        (11, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách bài viết', '${PERMISSIONS.VIEW_BLOG}', NOW(), 1, NOW(), 1),
        (12, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo bài viết', '${PERMISSIONS.CREATE_BLOG}', NOW(), 1, NOW(), 1),
        (13, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật bài viết', '${PERMISSIONS.UPDATE_BLOG}', NOW(), 1, NOW(), 1),
        (14, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa bài viết', '${PERMISSIONS.DELETE_BLOG}', NOW(), 1, NOW(), 1),

        -- Booking
        (15, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách đặt sản phẩm/dịch vụ', '${PERMISSIONS.VIEW_BOOKING}', NOW(), 1, NOW(), 1),
        (16, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo đặt sản phẩm/dịch vụ', '${PERMISSIONS.CREATE_BOOKING}', NOW(), 1, NOW(), 1),
        (17, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật đặt sản phẩm/dịch vụ', '${PERMISSIONS.UPDATE_BOOKING}', NOW(), 1, NOW(), 1),
        (18, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa đặt sản phẩm/dịch vụ', '${PERMISSIONS.DELETE_BOOKING}', NOW(), 1, NOW(), 1), --

        -- Category
        (19, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách danh mục', '${PERMISSIONS.VIEW_CATEGORY}', NOW(), 1, NOW(), 1),
        (20, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo danh mục', '${PERMISSIONS.CREATE_CATEGORY}', NOW(), 1, NOW(), 1),
        (21, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật danh mục', '${PERMISSIONS.UPDATE_CATEGORY}', NOW(), 1, NOW(), 1),
        (22, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa danh mục', '${PERMISSIONS.DELETE_CATEGORY}', NOW(), 1, NOW(), 1),

        -- Conversion Unit
        (23, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách đơn vị chuyển đổi', '${PERMISSIONS.VIEW_CONVERSION_UNIT}', NOW(), 1, NOW(), 1),
        (24, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo đơn vị chuyển đổi', '${PERMISSIONS.CREATE_CONVERSION_UNIT}', NOW(), 1, NOW(), 1),
        (25, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật đơn vị chuyển đổi', '${PERMISSIONS.UPDATE_CONVERSION_UNIT}', NOW(), 1, NOW(), 1),
        (26, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa đơn vị chuyển đổi', '${PERMISSIONS.DELETE_CONVERSION_UNIT}', NOW(), 1, NOW(), 1),

        -- File Upload
        (27, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách file', '${PERMISSIONS.VIEW_FILE}', NOW(), 1, NOW(), 1),
        (28, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo file', '${PERMISSIONS.CREATE_FILE}', NOW(), 1, NOW(), 1),
        (29, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật file', '${PERMISSIONS.UPDATE_FILE}', NOW(), 1, NOW(), 1),
        (30, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa file', '${PERMISSIONS.DELETE_FILE}', NOW(), 1, NOW(), 1),

        -- Order Detail
        (31, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách chi tiết đơn hàng', '${PERMISSIONS.VIEW_ORDER_DETAIL}', NOW(), 1, NOW(), 1),
        (32, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo chi tiết đơn hàng', '${PERMISSIONS.CREATE_ORDER_DETAIL}', NOW(), 1, NOW(), 1),
        (33, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật chi tiết đơn hàng', '${PERMISSIONS.UPDATE_ORDER_DETAIL}', NOW(), 1, NOW(), 1),
        (34, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa chi tiết đơn hàng', '${PERMISSIONS.DELETE_ORDER_DETAIL}', NOW(), 1, NOW(), 1),

        -- Order
        (35, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách đơn hàng', '${PERMISSIONS.VIEW_ORDER}', NOW(), 1, NOW(), 1),
        (36, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo đơn hàng', '${PERMISSIONS.CREATE_ORDER}', NOW(), 1, NOW(), 1),
        (37, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật đơn hàng', '${PERMISSIONS.UPDATE_ORDER}', NOW(), 1, NOW(), 1),
        (38, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa đơn hàng', '${PERMISSIONS.DELETE_ORDER}', NOW(), 1, NOW(), 1),

        -- Product
        (39, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách sản phẩm', '${PERMISSIONS.VIEW_PRODUCT}', NOW(), 1, NOW(), 1),
        (40, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo sản phẩm', '${PERMISSIONS.CREATE_PRODUCT}', NOW(), 1, NOW(), 1),
        (41, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật sản phẩm', '${PERMISSIONS.UPDATE_PRODUCT}', NOW(), 1, NOW(), 1),
        (42, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa sản phẩm', '${PERMISSIONS.DELETE_PRODUCT}', NOW(), 1, NOW(), 1),

        -- Review
        (43, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách đánh giá', '${PERMISSIONS.VIEW_REVIEW}', NOW(), 1, NOW(), 1),
        (44, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo đánh giá', '${PERMISSIONS.CREATE_REVIEW}', NOW(), 1, NOW(), 1),
        (45, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật đánh giá', '${PERMISSIONS.UPDATE_REVIEW}', NOW(), 1, NOW(), 1),
        (46, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa đánh giá', '${PERMISSIONS.DELETE_REVIEW}', NOW(), 1, NOW(), 1),

        -- Role
        (47, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách vai trò', '${PERMISSIONS.VIEW_ROLE}', NOW(), 1, NOW(), 1),
        (48, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo vai trò', '${PERMISSIONS.CREATE_ROLE}', NOW(), 1, NOW(), 1),
        (49, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật vai trò', '${PERMISSIONS.UPDATE_ROLE}', NOW(), 1, NOW(), 1),
        (50, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa vai trò', '${PERMISSIONS.DELETE_ROLE}', NOW(), 1, NOW(), 1),

        -- Unit
        (51, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách đơn vị tính', '${PERMISSIONS.VIEW_UNIT}', NOW(), 1, NOW(), 1),
        (52, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo đơn vị tính', '${PERMISSIONS.CREATE_UNIT}', NOW(), 1, NOW(), 1),
        (53, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật đơn vị', '${PERMISSIONS.UPDATE_UNIT}', NOW(), 1, NOW(), 1),
        (54, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa đơn vị', '${PERMISSIONS.DELETE_UNIT}', NOW(), 1, NOW(), 1),

        -- User
        (55, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách người dùng', '${PERMISSIONS.VIEW_USER}', NOW(), 1, NOW(), 1),
        (56, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo người dùng', '${PERMISSIONS.CREATE_USER}', NOW(), 1, NOW(), 1),
        (57, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật người dùng', '${PERMISSIONS.UPDATE_USER}', NOW(), 1, NOW(), 1),
        (58, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa người dùng', '${PERMISSIONS.DELETE_USER}', NOW(), 1, NOW(), 1),

        -- Variant
        (59, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Lấy danh sách phiên bản sản phẩm', '${PERMISSIONS.VIEW_VARIANT}', NOW(), 1, NOW(), 1),
        (60, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Tạo phiên bản sản phẩm', '${PERMISSIONS.CREATE_VARIANT}', NOW(), 1, NOW(), 1),
        (61, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Cập nhật phiên bản sản phẩm', '${PERMISSIONS.UPDATE_VARIANT}', NOW(), 1, NOW(), 1),
        (62, '${StringUtil.generateCode(CODE_PREFIX.Permission)}', 'Xóa phiên bản sản phẩm', '${PERMISSIONS.DELETE_VARIANT}', NOW(), 1, NOW(), 1)
    `);
    await queryRunner.query(`
      SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions), true);
    `);

    // Insert default role
    await queryRunner.query(`
      INSERT INTO roles (id, code, name, description, created_at, created_by, updated_at, updated_by)
      VALUES (1, '${StringUtil.generateCode(CODE_PREFIX.Role)}', 'Admin', 'Quản trị viên hệ thống', NOW(), 1, NOW(), 1)
    `);
    await queryRunner.query(`
      SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles), true);
    `);

    // Insert role permissions
    await queryRunner.query(`
      INSERT INTO role_permission_relations (role_id, permission_id)
      VALUES (1, 1)
    `);

    // Insert default admin users
    await queryRunner.query(`
      INSERT INTO users (
        id, code, phone, password, first_name, last_name, email, address, birthday, created_at, created_by, updated_at, updated_by, role_ids
      )
      VALUES
        (
          1,
          '${StringUtil.generateCode(CODE_PREFIX.User)}',
          '0967845619',
          '$2b$10$7QC88JfkYlMSqDb5FisVAecIxbJMu9DkHP5XGLArZNPzYYAD8fNoC', -- Abcd1234!@#$
          'Admin',
          'Đăng Lưu',
          'phandangluu.07061993@gmail.com',
          'C7C/18H Phạm Hùng, Xã Bình Hưng, Huyện Bình Chánh, TP.Hồ Chí Minh',
          '1993-06-07',
          NOW(),
          1,
          NOW(),
          1,
          ARRAY[1]
        ),
        (
          2,
          '${StringUtil.generateCode(CODE_PREFIX.User)}',
          '0868941099',
          '$2b$10$7QC88JfkYlMSqDb5FisVAecIxbJMu9DkHP5XGLArZNPzYYAD8fNoC', -- Abcd1234!@#$
          'Admin',
          'Thanh Nga',
          'tngaa099@gmail.com',
          '253 Dân Công Hoả Tuyến, Xã Vĩnh Lộc A, Huyện Bình Chánh, TP.Hồ Chí Minh',
          '1999-04-10',
          NOW(),
          1,
          NOW(),
          1,
          ARRAY[1]
        )
    `);
    await queryRunner.query(`
      SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), true);
    `);

    // Insert user roles
    await queryRunner.query(`
      INSERT INTO user_role_relations (user_id, role_id)
      VALUES
        (1, 1),
        (2, 1)
    `);

    // Insert categories
    await queryRunner.query(`
      INSERT INTO categories (
        id, code, name, slug, type, thumbnail_id, created_at, created_by, updated_at, updated_by
      )
      VALUES
        (1, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Dịch vụ Photocopy & In ấn', 'dich-vu-photocopy-in-an', '${ECategoryType.SERVICE}', NULL, NOW(), 1, NOW(), 1),
        (2, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Scan & Chuyển đổi số', 'scan-chuyen-doi-so', '${ECategoryType.SERVICE}', NULL, NOW(), 1, NOW(), 1),
        (3, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Đóng gáy - Thành phẩm tài liệu', 'dong-gay-thanh-pham-tai-lieu', '${ECategoryType.SERVICE}', NULL, NOW(), 1, NOW(), 1),
        (4, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Ép Plastic & Gia công', 'ep-plastic-gia-cong', '${ECategoryType.SERVICE}', NULL, NOW(), 1, NOW(), 1),
        (5, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Thiết kế & In ấn văn phòng phẩm', 'thiet-ke-in-an-van-phong-pham', '${ECategoryType.SERVICE}', NULL, NOW(), 1, NOW(), 1),
        (6, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Dịch vụ cho học sinh - sinh viên', 'dich-vu-cho-hoc-sinh-sinh-vien', '${ECategoryType.SERVICE}', NULL, NOW(), 1, NOW(), 1),
        (7, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Dịch vụ online & tiện ích thêm', 'dich-vu-online-tien-ich-them', '${ECategoryType.SERVICE}', NULL, NOW(), 1, NOW(), 1),
        (8, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Hoa kẽm nhung', 'hoa-kem-nhung', '${ECategoryType.PRODUCT}', NULL, NOW(), 1, NOW(), 1),
        (9, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Quà tặng kèm thiệp/hộp quà decor', 'qua-tang-kem-thiep-hop-qua-decor', '${ECategoryType.PRODUCT}', NULL, NOW(), 1, NOW(), 1),
        (10, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Đồ decor nội thất', 'do-decor-noi-that', '${ECategoryType.PRODUCT}', NULL, NOW(), 1, NOW(), 1),
        (11, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Phụ kiện trang trí sự kiện', 'phu-kien-trang-tri-su-kien', '${ECategoryType.PRODUCT}', NULL, NOW(), 1, NOW(), 1),
        (12, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Sản phẩm nghệ thuật cá nhân', 'san-pham-nghe-thuat-ca-nhan', '${ECategoryType.PRODUCT}', NULL, NOW(), 1, NOW(), 1),
        (13, '${StringUtil.generateCode(CODE_PREFIX.Category)}', 'Phụ kiện nhỏ/đồ trang sức handmade', 'phu-kien-nho-do-trang-suc-handmade', '${ECategoryType.PRODUCT}', NULL, NOW(), 1, NOW(), 1)
    `);
    await queryRunner.query(`
      SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories), true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete data in reverse order to maintain referential integrity

    await queryRunner.query('DELETE FROM conversion_units WHERE id BETWEEN 1 AND 35');
    await queryRunner.query(`SELECT setval('conversion_units_id_seq', 1, false);`);

    await queryRunner.query('DELETE FROM units WHERE id BETWEEN 1 AND 8');
    await queryRunner.query(`SELECT setval('units_id_seq', 1, false);`);

    await queryRunner.query('DELETE FROM categories WHERE id BETWEEN 1 AND 9');
    await queryRunner.query(`SELECT setval('categories_id_seq', 1, false);`);

    await queryRunner.query('DELETE FROM file_uploads WHERE id BETWEEN 1 AND 19');
    await queryRunner.query(`SELECT setval('file_uploads_id_seq', 1, false);`);

    await queryRunner.query('DELETE FROM user_roles WHERE id IN (1, 2)');
    await queryRunner.query(`SELECT setval('user_roles_id_seq', 1, false);`);

    await queryRunner.query('DELETE FROM users WHERE id IN (1, 2)');
    await queryRunner.query(`SELECT setval('users_id_seq', 1, false);`);

    await queryRunner.query('DELETE FROM role_permissions WHERE id IN (1)');
    await queryRunner.query(`SELECT setval('role_permissions_id_seq', 1, false);`);

    await queryRunner.query('DELETE FROM roles WHERE id IN (1)');
    await queryRunner.query(`SELECT setval('roles_id_seq', 1, false);`);

    await queryRunner.query('DELETE FROM permissions WHERE id BETWEEN 1 AND 70');
    await queryRunner.query(`SELECT setval('permissions_id_seq', 1, false);`);
  }
}
