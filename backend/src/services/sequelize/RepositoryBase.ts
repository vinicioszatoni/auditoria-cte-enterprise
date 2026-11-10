//
import sequelize, {Model, WhereOptions} from 'sequelize';

import {Logger} from '../Logger';
import {Repository} from './Repository';

export abstract class RepositoryBase<T extends Model> implements Repository<T> {
  constructor(
    protected readonly Model: sequelize.ModelStatic<T>,
    private readonly logger: Logger
  ) {
    this.logger = logger;
  }
  async save(model: T): Promise<T> {
    try {
      const result = await model.save();
      return result;
    } catch (error: unknown) {
      this.logger.error((error as Error).message);
      throw error;
    }
  }
  async findById(id: string | number): Promise<T> {
    try {
      const item = await this.Model.findByPk(id);
      return item ?? ({} as T);
    } catch (error: unknown) {
      this.logger.error((error as Error).message);
      return {} as T;
    }
  }
  async get(where: WhereOptions, order = 'id', pageSize = 10, pageNumber = 1): Promise<T[]> {
    try {
      const items = await this.Model.findAll({
        where,
        order: [order],
        offset: (pageNumber - 1) * pageSize,
        limit: pageSize
      });
      return items;
    } catch (error: unknown) {
      this.logger.error((error as Error).message);
      return [] as T[];
    }
  }
  async deleteById(id: string | number): Promise<boolean> {
    try {
      const item = await this.findById(id);
      await item.destroy();
      return true;
    } catch (error: unknown) {
      this.logger.error((error as Error).message);
      return false;
    }
  }
}
