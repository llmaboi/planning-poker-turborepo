import urlData from '@fastify/url-data';
import fastify, { FastifyInstance } from 'fastify';
import { getEnvConfig } from '../config/env';
import displayRoutes from '../routes/displays';
import roomRoutes from '../routes/rooms';
import webSockets from '@fastify/websocket';

let server: null | FastifyInstance = null;
getEnvConfig();

export async function createServer() {
  if (!server) server = await fastify({ logger: true });

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
