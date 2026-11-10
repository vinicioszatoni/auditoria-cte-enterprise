//
import {WhereOptions} from 'sequelize';

export interface Repository<T> {
  save(model: T): Promise<T>;
  findById(id: string | number): Promise<T>;
  get(where: WhereOptions, order: string, pageSize: number, pageNumber: number): Promise<T[]>;
  deleteById(id: string | number): Promise<boolean>;
}
