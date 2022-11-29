import { FastifyInstance } from 'fastify';
import { getEnvConfig } from './env';
import { registerMySQL } from './mysql';
import { createServer } from './server';

let testServer: FastifyInstance;
const errorSpy = jest.spyOn(console, 'error');

beforeAll(async () => {
  getEnvConfig();
  testServer = await createServer();
  await registerMySQL(testServer);
  errorSpy.mockImplementation();
});

afterAll(async () => {
  if (testServer) {
    await testServer.close();
  }
});

afterEach(() => {
  errorSpy.mockReset();
});

export { testServer, errorSpy };
