import { FindOptionsRelations, FindOptionsSelect, FindOptionsWhereProperty } from 'typeorm';

type TNe = {
  $ne: unknown;
};

type TLt = {
  $lt: number | Date;
};

type TLte = {
  $lte: number | Date;
};

type TGt = {
  $gt: number | Date;
};

type TGte = {
  $gte: number | Date;
};

type TIn<T> = {
  $in: T[keyof T][];
};

type TNotIn = {
  $nIn: unknown[];
};

type TContains = {
  $contains: string | number;
};

type TNotContains = {
  $nContains: unknown;
};

type TIContains = {
  $iContains: string | number;
};

type TNotIContains = {
  $nIContains: unknown;
};

type TNull = {
  $null: boolean;
};

type TNotNull = {
  $nNull: boolean;
};

type TBetween = {
  $between: [number, number] | [Date, Date] | [string, string];
};

export type OperatorType<T> =
  | TNe
  | TLt
  | TLte
  | TGt
  | TGte
  | TIn<T>
  | TNotIn
  | TContains
  | TNotContains
  | TNull
  | TNotNull
  | TBetween
  | TIContains
  | TNotIContains;

type ExtendedFindOptionsWhere<Entity> = {
  [P in keyof Entity]?: P extends 'toString'
    ? unknown
    :
        | FindOptionsWhereProperty<NonNullable<Entity[P]>>
        | OperatorType<Entity>
        | Entity[P]
        | ExtendedFindOptionsWhere<Entity>;
};

export type IWhere<T> = ExtendedFindOptionsWhere<T>;

export interface GetInfoFromQueryProps<Entity> {
  relations: FindOptionsRelations<Entity>;
  select: FindOptionsSelect<Entity>;
}

export interface AddKeyValueInObjectProps<Entity> extends GetInfoFromQueryProps<Entity> {
  stack: string[];
  expandRelation?: boolean;
}
