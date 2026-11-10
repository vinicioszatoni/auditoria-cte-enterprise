import * as winston from 'winston';

const level = process.env.LOG_LEVEL_ENABLED?.toLowerCase() || 'error';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      format: winston.format.json(),
      // esse é o nível de log que será exibido no pod dentro do ArgoCD,
      // se você não precisa dele, pode remover e usar somente o global
      level
    })
  ],
  // esse é o nível de log que será enviado para o New Relic, se você remover o de cima, este será o utilizado para todos os logs
  level
});

const createConsoleOverride =
  (loggerMethod: unknown) =>
  (...args: unknown[]) => {
    if (args.length === 0) return;
    const [first, ...rest] = args;
    if (rest.length === 0) {
      loggerMethod(first);
    } else if (rest.length === 1 && typeof rest[0] === 'object') {
      loggerMethod(first, rest[0]);
    } else {
      loggerMethod(first, {additionalData: rest});
    }
  };

// Override default console methods to use Winston logger
console.info = createConsoleOverride(logger.info.bind(logger));
console.warn = createConsoleOverride(logger.warn.bind(logger));
console.error = createConsoleOverride(logger.error.bind(logger));
console.debug = createConsoleOverride(logger.debug.bind(logger));
console.log = createConsoleOverride(logger.info.bind(logger));

export default logger;
