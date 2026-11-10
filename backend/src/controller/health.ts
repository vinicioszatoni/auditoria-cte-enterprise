import {loadPackageJson} from '../util';

// https://wiki.grupoboticario.digital/wiki/Padrão_Healthcheck
export const health = {
  check() {
    return {status: 'ok'};
  },

  async complete() {
    const pkg = loadPackageJson();
    return {
      meta: {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        uptime: process.uptime(),
        nodeVersion: process.version
      },
      status: 'ok',
      dependencies: []
    };
  }
};
