import { FastifyPluginAsync, RequestGenericInterface } from 'fastify';
import Websocket from 'ws';
import {
  createDisplay,
  getDisplay,
  getDisplaysForRoom,
  updateDisplay,
} from '../methods/mysqlDisplays';
import { ZodDisplay } from 'planning-poker-types';

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
  };
}

const roomSockets = new Map<number, Websocket[]>();

// eslint-disable-next-line @typescript-eslint/require-await
const displayRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<GetDisplayParams>(
    '/displays/room/:id/socket',
    { websocket: true },
    (connection, request) => {
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
        return reply.send(500); // json message?
      }
    }
  );

  fastify.get<GetDisplayParams>('/displays/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      return getDisplay(fastify.mysql, id);
    } catch (err) {
      return reply.send(500); // json message?
    }
  });

  fastify.patch<UpdateDisplayParams>(
    '/displays/:id',
    async (request, reply) => {
      const { id } = request.params;
      const { roomId, name, cardValue } = request.body;

      try {
        const parsedDisplayData = ZodDisplay.parse({
          id: parseInt(id),
          roomId,
          name,
          cardValue,
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

  fastify.post<CreateDisplayParams>('/displays', async (request, reply) => {
    const { roomId, name, cardValue, isHost } = request.body;

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
