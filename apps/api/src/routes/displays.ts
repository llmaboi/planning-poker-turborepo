import { FastifyPluginAsync, RequestGenericInterface } from 'fastify';
import Websocket from 'ws';
import {
  createDisplay,
  getDisplay,
  getDisplayByName,
  getDisplaysForRoom,
  updateDisplay,
} from '../methods/mysqlDisplays';
import { ZodDisplay } from 'planning-poker-types';
import { getRoomSockets } from './roomSockets';

interface GetDisplayParams extends RequestGenericInterface {
  Params: {
    id: string;
  };
}

interface CreateDisplayParams extends RequestGenericInterface {
  Body: {
    roomId: number;
    name: string;
    cardValue: number;
    isHost: boolean;
  };
}

interface UpdateDisplayParams extends GetDisplayParams {
  Body: {
    roomId: number;
    name: string;
    cardValue: number;
    isHost: boolean;
  };
}

interface GetDisplayByNameParams extends RequestGenericInterface {
  Querystring: {
    name: string;
    roomId: number;
  };
}

// const roomSockets = new Map<number, Websocket[]>();

// eslint-disable-next-line @typescript-eslint/require-await
const displayRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<GetDisplayParams>(
    '/displays/room/:id/socket',
    { websocket: true },
    (connection, request) => {
      const { roomSockets } = getRoomSockets();
      const { id } = request.params;

      // Registration only happens on opening of the connection.
      if (connection.socket.OPEN) {
        const existing = roomSockets.get(parseInt(id));

        if (existing) {
          roomSockets.set(parseInt(id), [...existing, connection.socket]);
        } else {
          roomSockets.set(parseInt(id), [connection.socket]);
        }
      }
    }
  );

  fastify.get<GetDisplayParams>(
    '/displays/room/:id',
    async (request, reply) => {
      const { id } = request.params;

      try {
        return getDisplaysForRoom(fastify.mysql, id);
      } catch (err) {
        return reply.code(500).send(JSON.stringify(err));
      }
    }
  );

  fastify.get<GetDisplayParams>('/displays/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      return getDisplay(fastify.mysql, id);
    } catch (err) {
      return reply.code(500).send(JSON.stringify(err));
    }
  });

  fastify.patch<UpdateDisplayParams>(
    '/displays/:id',
    async (request, reply) => {
      const { id } = request.params;
      const { roomId, name, cardValue, isHost } = request.body;
      const { roomSockets } = getRoomSockets();

      try {
        const parsedDisplayData = ZodDisplay.parse({
          id: parseInt(id),
          roomId,
          name,
          cardValue,
          isHost,
        });

        const displayData = await updateDisplay(
          fastify.mysql,
          parsedDisplayData
        );

        void getDisplaysForRoom(fastify.mysql, roomId.toString()).then(
          (displays) => {
            Array.from(roomSockets.values()).forEach((socket) => {
              socket.forEach((webSocket) => {
                if (webSocket.OPEN) {
                  webSocket.send(JSON.stringify(displays));
                }
              });
            });
          }
        );

        return displayData;
      } catch (err) {
        console.error(err);
        return reply.code(500).send(JSON.stringify(err));
      }
    }
  );

  fastify.get<GetDisplayByNameParams>(
    '/displays/name',
    async (request, reply) => {
      const { name, roomId } = request.query;

      try {
        return getDisplayByName(fastify.mysql, name, roomId);
      } catch (err) {
        return reply.code(500).send(JSON.stringify(err));
      }
    }
  );

  fastify.post<CreateDisplayParams>('/displays', async (request, reply) => {
    const { roomId, name, cardValue, isHost } = request.body;
    const { roomSockets } = getRoomSockets();

    try {
      const {
        roomId: parsedRoomId,
        name: parsedName,
        cardValue: parsedCardValue,
        isHost: parsedIsHost,
      } = ZodDisplay.parse({
        id: 1234,
        roomId,
        name,
        cardValue,
        isHost,
      });

      const displayData = createDisplay(fastify.mysql, {
        roomId: parsedRoomId,
        name: parsedName,
        cardValue: parsedCardValue,
        isHost: parsedIsHost,
      });

      void getDisplaysForRoom(fastify.mysql, roomId.toString()).then(
        (displays) => {
          Array.from(roomSockets.values()).forEach((socket) => {
            socket.forEach((myWs) => {
              if (myWs.OPEN) {
                myWs.send(JSON.stringify(displays));
              }
            });
          });
        }
      );

      return displayData;
    } catch (err) {
      console.error(err);
      return reply.code(500).send(JSON.stringify(err));
    }
  });
};

export default displayRoutes;
