import { ESortType } from '../enums/common.enum';

export type TOrderQuery<T> = {
  [key in keyof T]?: ESortType;
};
