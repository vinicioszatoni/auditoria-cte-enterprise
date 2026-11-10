import {getOpenapiDefinition} from './swagger';
import logger from './util/logger';
// @scf-region loading-routes
import {route} from './route/health';
// @end-scf-region
import fastifyHelmet from '@fastify/helmet';
import fastifySwagger from '@fastify/swagger';
import fastify, {
  FastifyRequest,
  type FastifyInstance,
  FastifyReply
} from 'fastify';

const app = fastify();

interface HttpError extends Error {
  code: number;
}

export const appSetup = async (): Promise<FastifyInstance> => {
  await app.register(fastifySwagger, getOpenapiDefinition());
  await app.register(fastifyHelmet);

  // @scf-region routes-endpoints

  app.get('/healthcheck', route.check.handler);
  app.get('/healthcheck/complete', route.complete.handler);

  // @end-scf-region

  app.setErrorHandler(
    async (error: HttpError, req: FastifyRequest, reply: FastifyReply) => {
      logger.error(req.routeOptions.url);
      logger.error(error.code);
      logger.error(error.message);
      logger.error(error.stack);

      await reply.send(error);
    }
  );

  return await app;
};
