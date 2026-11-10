//
import {Options, Sequelize} from 'sequelize';
import {Logger} from '../Logger';
import {initSequelizeConfig} from './SequelizeInitConfig';

export async function createSequelizeConnection(
  logger: Logger,
  options: Options = initSequelizeConfig
): Promise<Sequelize> {
  try {
    const sequelize = new Sequelize(options);

    await sequelize.authenticate();

    return sequelize;
  } catch (error: unknown) {
    logger.error(`Error creating Sequelize Connection object: ${(error as Error).message}`);
    throw error;
  }
}
