import {health} from '../controller/health';

// Read more about health checks on https://sites.google.com/grupoboticario.com.br/engenhariadesoftware/padr%C3%B5es/health-check
export const route = {
  check: {
    handler: health.check,
    schema: {
      tags: ['Health Check']
    }
  },
  complete: {
    handler: health.complete,
    schema: {
      tags: ['Health Check'],
      response: {
        200: {
          type: 'object',
          required: ['meta', 'status', 'dependencies'],
          properties: {
            meta: {
              type: 'object',
              required: ['name', 'version'],
              properties: {
                name: {
                  type: 'string',
                  description: 'Application Name'
                },
                version: {
                  type: 'string',
                  format:
                    '^(0|[1-9]d*).(0|[1-9]d*).(0|[1-9]d*)(?:-((?:0|[1-9]d*|d*[a-zA-Z-][0-9a-zA-Z-]*)(?:.(?:0|[1-9]d*|d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:+([0-9a-zA-Z-]+(?:.[0-9a-zA-Z-]+)*))?$',
                  description: 'Semantic version'
                },
                uptime: {
                  type: 'integer',
                  description:
                    'The number of seconds the current Node.js process has been running.'
                },
                nodeVersion: {
                  type: 'string',
                  format:
                    '^(0|[1-9]d*).(0|[1-9]d*).(0|[1-9]d*)(?:-((?:0|[1-9]d*|d*[a-zA-Z-][0-9a-zA-Z-]*)(?:.(?:0|[1-9]d*|d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:+([0-9a-zA-Z-]+(?:.[0-9a-zA-Z-]+)*))?$',
                  description: 'Node.js version'
                }
              }
            },
            status: {
              type: 'string',
              enum: ['ok', 'nok', 'warning'],
              description:
                'Health status: \n * ok - All dependencies are healthy, \n * nok - At least one critical dependency is not healthy, \n * warning - At least one no critical dependency has nok or warning status'
            },
            dependencies: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name', 'critical', 'status', 'type'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Dependency name'
                  },
                  critical: {
                    type: 'boolean',
                    description: 'true if this dependency is critical'
                  },
                  status: {
                    type: 'string',
                    enum: ['ok', 'nok', 'warning'],
                    description:
                      'Health status: \n * ok - Dependency is healthy, \n * nok - Dependency is unhealthy, \n * warning - There is some issue affecting this dependency'
                  },
                  type: {
                    type: 'string',
                    enum: ['cache', 'database', 'api', 'aws-service', 'other'],
                    description:
                      'Health status: ok - Dependency is healthy, nok - Dependency is unhealthy, warning - There is some issue affecting this dependency'
                  },
                  response_time: {
                    type: 'integer',
                    description: 'Dependency response time in milliseconds'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
