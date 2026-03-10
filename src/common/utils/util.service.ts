import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

import { EnvironmentVariables } from '@/common/helpers/env.validation';

import { NumberUtil } from './number.util';
import { StringUtil } from './string.util';

@Injectable()
export class UtilService {
  constructor(private readonly configService: ConfigService<EnvironmentVariables>) {}

  pick<T extends object, K extends keyof T>(instance: T, keys: K[]): Pick<T, K> {
    return keys.reduce(
      (picked, key) => {
        if (key in instance) picked[key] = instance[key];

        return picked;
      },
      {} as Pick<T, K>,
    );
  }

  // String handling
  get getRandomUUID(): string {
    return v4();
  }

  slugify(value: string): string {
    return StringUtil.slugify(value);
  }

  generateCode(prefix: string): string {
    return StringUtil.generateCode(prefix);
  }

  removeUnicode(value: string): string {
    return StringUtil.removeUnicode(value);
  }

  splitPascalCase(value: string): string {
    return StringUtil.splitPascalCase(value);
  }

  // Number handling
  getRandomNumber(min: number, max: number): number {
    return NumberUtil.getRandomNumber(min, max);
  }

  // Environment handling
  get nodeEnv(): 'development' | 'production' | 'test' {
    const value = this.configService.get<string>('NODE_ENV');

    return value as 'development' | 'production' | 'test';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  getEntity(className: string): string {
    return this.splitPascalCase(
      className.replace(/(module)|(controller)|(resolver)|(service)|(repository)/gi, ''),
    )
      .replace(/\s/g, '_')
      .toLowerCase();
  }
}
