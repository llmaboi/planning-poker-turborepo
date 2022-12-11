import { FastifyPluginAsync, RequestGenericInterface } from 'fastify';
import { RoomRaw, ZodRoomRaw } from 'planning-poker-types';
import {
  createRoom,
  getRoom,
  getRooms,
  updateRoom,
  updateRoomDisplayCards,
} from '../methods/mysqlRooms';
import { getRoomDisplaysSockets } from './roomDisplaysSockets';

interface RoomParams extends RequestGenericInterface {
  Params: {
    id: string;
  };
}

interface RoomCreate extends RequestGenericInterface {
  Body: Omit<RoomRaw, 'id'>;
}

interface RoomUpdate extends RoomParams {
  Body: RoomRaw;
}

// eslint-disable-next-line @typescript-eslint/require-await
const roomRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<RoomParams>('/rooms/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      return getRoom(fastify.mysql, id);
    } catch (err) {
      return reply.code(500).send(JSON.stringify(err));
    }
  });

  fastify.get('/rooms', async (request, reply) => {
    try {
      return getRooms(fastify.mysql);
    } catch (err) {
      return reply.code(500).send(JSON.stringify(err));
    }
  });

  fastify.patch<RoomUpdate>('/rooms/:id', async (request, reply) => {
    const { id } = request.params;
    const { label, name, show_votes } = request.body;

    try {
      const parsedRoomData = ZodRoomRaw.parse({
        id: parseInt(id),
        label,
        name,
        show_votes,
      });

      return updateRoom(fastify.mysql, {
        id: parsedRoomData.id,
        label: parsedRoomData.label,
        name: parsedRoomData.name,
        showVotes: parsedRoomData.show_votes === 1,
      });
    } catch (err) {
      console.error(err);
      return reply.code(500).send(JSON.stringify(err));
    }
  });

  fastify.post<RoomCreate>('/rooms', async (request, reply) => {
    const { show_votes, label, name } = request.body;

    try {
      const { label: parsedLabel, name: parsedName } = ZodRoomRaw.parse({
        id: 1234,
        label,
        name,
      });

      return createRoom(fastify.mysql, {
        label: parsedLabel,
        name: parsedName,
        showVotes: show_votes === 1,
      });
    } catch (err) {
      console.error(err);
      return reply.code(500).send(JSON.stringify(err));
    }
  });

  fastify.patch<RoomParams>('/rooms/:id/card-reset', async (request, reply) => {
    const { id } = request.params;
    const { roomDisplaysSockets } = getRoomDisplaysSockets();

    try {
      const displaysRaw = await updateRoomDisplayCards(fastify.mysql, id);
      const roomSocket = roomDisplaysSockets.get(parseInt(id));

      if (roomSocket) {
        roomSocket.forEach((socket) => {
          if (socket.OPEN) {
            socket.send(JSON.stringify(displaysRaw));
          }
        });
      }

      return displaysRaw;
    } catch (err) {
      return reply.code(500).send(JSON.stringify(err));
    }
  });
};

export default roomRoutes;
