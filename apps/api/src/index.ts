import { createServer } from './config/server';
import { getEnvConfig } from './config/env';
import { registerMySQL } from './config/mysql';
import { MySQLPromisePool } from '@fastify/mysql';

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLPromisePool;
  }
}

async function start() {
  const envConfig = getEnvConfig();

  try {
    const server = await createServer();
    await registerMySQL(server);

    // TODO: I'm not sure if this is correct
    server.listen({ port: envConfig.SERVER_PORT, host: '0.0.0.0' }, () => {
      console.log('Server started...');
      server.printRoutes();
    });
  } catch (error) {
    console.log('Server not started...');
    console.error(error);
    process.exit(1);
  }
}

void start();
