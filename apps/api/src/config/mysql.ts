import fastifyMySQL from '@fastify/mysql';
import { FastifyInstance } from 'fastify';
import { getEnvConfig } from './env';

export async function registerMySQL(server: FastifyInstance) {
  const envConfig = getEnvConfig();

  // await server.register(fastifyMySQL, {
  //   connectionString: envConfig.DB_URI,
  //   promise: true,
  //   rowsAsArray: true,
  // });

  await server.register(fastifyMySQL, {
    host: envConfig.DB_HOST,
    database: envConfig.DB_NAME,
    user: envConfig.DB_USER,
    password: envConfig.DB_PASS,
    port: envConfig.DB_PORT,
    promise: true,
  });
}
