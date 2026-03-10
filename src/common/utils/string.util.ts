import { customAlphabet } from 'nanoid';
import slugify from 'slugify';

export class StringUtil {
  static slugify(value: string): string {
    return slugify(value, { trim: true, lower: true });
  }

  static generateCode(prefix: string): string {
    const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = nanoid();

    return `${prefix}-${timestamp}${randomPart}`;
  }

  static removeUnicode(value: string): string {
    return value
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  static splitPascalCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  }
}
