//
import * as fs from 'fs';
import { join } from 'node:path';
import { Dialect, Options } from 'sequelize';

export const initSequelizeConfig: Options = {
  port: Number(process.env.AUDITORIA_CTE_BACKEND_PORT ?? process.env.DATABASE_PORT),
  username: process.env.AUDITORIA_CTE_BACKEND_USER ?? process.env.DATABASE_USER,
  password: process.env.AUDITORIA_CTE_BACKEND_PASSWORD ?? process.env.DATABASE_PASSWORD,
  host: process.env.AUDITORIA_CTE_BACKEND_HOST ?? process.env.DATABASE_HOST,
  database: process.env.AUDITORIA_CTE_BACKEND_DATABASE ?? process.env.DATABASE_NAME,
  dialect: 'postgres' as Dialect,
  dialectOptions: {
    application_name: process.env.POD_NAME,
    ssl: {
      ca: fs.readFileSync(join(__dirname, '..', 'rds-global-bundle.pem'))
    }
  }
};
