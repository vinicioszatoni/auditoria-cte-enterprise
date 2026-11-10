import * as fs from 'fs-extra';
import * as path from 'path';
import {loadPackageJson} from './util';

const getSchemas = (): Array<Schema> => {
  const schemasDir = path.resolve(__dirname, 'schema');
  let schemas = [];
  if (fs.pathExistsSync(schemasDir)) {
    schemas = fs.readdirSync(schemasDir).map((fileName: string) => {
      return {
        $id: path.basename(fileName, path.extname(fileName)),
        ...fs.readJsonSync(path.resolve(schemasDir, fileName))
      };
    });
  }
  return schemas;
};

interface Schema {
  id: string;
}

interface OpenApiDefinition {
  routePrefix: string;
  openapi: {
    info: {
      title: string;
      description: string;
      version: string;
    };
    components: {
      schemas: Record<string, unknown>;
    };
  };
  uiConfig: {
    deepLinking: boolean;
  };
  staticCSP: boolean;
  transformStaticCSP: (header: unknown) => unknown;
  exposeRoute: boolean;
}

export const getOpenapiDefinition = (): OpenApiDefinition => {
  const schemas: Record<string, unknown> = {};
  getSchemas().forEach((schema: Schema) => {
    schemas[schema.id] = schema;
  });

  const packageInfo = loadPackageJson();

  return {
    routePrefix: '/doc',
    openapi: {
      info: {
        title: packageInfo.name,
        description: packageInfo.description,
        version: packageInfo.version
      },
      components: {
        schemas
      }
    },
    uiConfig: {
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header: unknown) => {
      return header;
    },
    exposeRoute: true
  };
};

const getPageSchema: unknown = (itemSchema: {properties: unknown}) => {
  return {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _links: {
              type: 'object',
              properties: {
                self: {type: 'string'}
              }
            },
            ...itemSchema.properties
          }
        }
      },
      _meta: {
        type: 'object',
        properties: {
          offset: {type: 'number'},
          limit: {type: 'number'},
          total: {type: 'number'}
        }
      },
      _links: {
        type: 'object',
        properties: {
          self: {type: 'string'},
          next: {type: 'string'},
          last: {type: 'string'},
          first: {type: 'string'},
          prev: {type: 'string'}
        }
      }
    }
  };
};

module.exports = {
  getOpenapiDefinition,
  getPageSchema,
  getSchemas
};
