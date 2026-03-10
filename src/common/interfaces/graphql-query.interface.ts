export interface IQuery {
  where?: string;
  pagination?: {
    page?: number;
    limit?: number;
  };
  order?: string;
}
