import {FastifyInstance} from 'fastify';
import {appSetup} from '../app';

jest.mock('../util', () => ({
  loadPackageJson: jest.fn(() => {
    return {
      name: '@ts-single-test321/'
    };
  })
}));

let server: FastifyInstance;

beforeAll(async () => {
  server = await appSetup();
  await server.listen({port: 8080, host: '0.0.0.0'});
});

afterAll(async () => {
  await server.close();
});

it('GET:/healthcheck route', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/healthcheck'
  });

  const expected = {status: 'ok'};

  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toBe(
    'application/json; charset=utf-8'
  );
  expect(JSON.parse(response.body)).toEqual(expected);
});

it('GET:/healthcheck/complete route', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/healthcheck/complete'
  });

  const expected = {
    meta: {
      name: '@ts-single-test321/',
      description: '',
      uptime: 1.944190388,
      nodeVersion: 'v14.16.0'
    },
    status: 'ok',
    dependencies: []
  };

  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toBe(
    'application/json; charset=utf-8'
  );
  expect(JSON.parse(response.body).meta.name).toBe(expected.meta.name);
  expect(JSON.parse(response.body).status).toBe(expected.status);
  expect(JSON.parse(response.body).dependencies).toEqual(expected.dependencies);
});
