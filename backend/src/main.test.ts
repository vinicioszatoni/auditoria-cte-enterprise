import 'jest';
import {appSetup} from './app';
import {FastifyInstance} from 'fastify';

let server: FastifyInstance;

beforeAll(async () => {
  server = await appSetup();
  await server.listen({port: 8080, host: '0.0.0.0'});
});

afterAll(async () => {
  await server.close();
});

it('GET `/not/found` route', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/not/found'
  });

  const expected = {
    error: 'Not Found',
    message: 'Route GET:/not/found not found',
    statusCode: 404
  };

  expect(response.statusCode).toBe(404);
  expect(response.headers['content-type']).toBe(
    'application/json; charset=utf-8'
  );
  expect(JSON.parse(response.body)).toEqual(expected);
});
