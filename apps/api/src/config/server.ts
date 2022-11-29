import urlData from '@fastify/url-data';
import fastify from 'fastify';
import { getEnvConfig } from '../config/env';
import displayRoutes from '../routes/displays';
import roomRoutes from '../routes/rooms';
import webSockets from '@fastify/websocket';

getEnvConfig();
const server = fastify({ logger: true });

export async function createServer() {
  await server.register(urlData);

  await server.register(webSockets, {
    options: {
      maxPayload: 1048576,
    },
  });

  await server.register(roomRoutes, { prefix: '/api/' });
  await server.register(displayRoutes, { prefix: '/api/' });
  // app.use(express.json());

  return server;
}
