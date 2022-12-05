import {
  createDisplay,
  createRoom,
  getDisplayByName,
  getRoomById,
  getRoomByName,
  getRoomDisplays,
  getRooms,
  updateDisplay,
  updateRoom,
  updateRoomDisplayCards,
} from '../api/mysqlFastify';
import { queryClient } from '../config/queryClient';
import { useMutation, useQuery } from 'react-query';
import {
  Display,
  DisplayRaw,
  Room,
  ZodDisplay,
  ZodRoom,
} from 'planning-poker-types';
import { displayRawToDisplay } from '../api/helpers';

function useGetRoomDisplays({ roomId }: { roomId: number }) {
  return useQuery<Display[]>(['displays', roomId], async () => {
    const displays = await getRoomDisplays(roomId);

    return displays;
  });
}

interface UpdateDisplayProps {
  id: number;
  cardValue: number;
  isHost: boolean;
  name: string;
}

/**
 * Mutation hook to update a room
 */
function useUpdateDisplay({ roomId }: { roomId: number }) {
  return useMutation(
    ({ id, cardValue, isHost, name }: UpdateDisplayProps): Promise<Display> =>
      updateDisplay({ roomId, id, cardValue, isHost, name }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['display', data.id], data);
      },
    }
  );
}

function useCreateOrUpdateDisplayByName() {
  return useMutation(
    async ({
      displayName,
      roomId,
      cardValue,
      isHost,
    }: {
      displayName: string;
      roomId: number;
      cardValue: number;
      isHost: boolean;
    }): Promise<Display> => {
      try {
        const display = await getDisplayByName(displayName, roomId);
        // TODO: Ensure the values match so update the display...

        // If the results match just return it
        if (
          display.roomId === roomId &&
          display.cardValue === cardValue &&
          display.isHost === isHost
        ) {
          return display;
        }

        // otherwise update then return updated value
        const updatedDisplay = await updateDisplay({
          roomId,
          name: displayName,
          id: display.id,
          cardValue,
          isHost,
        });

        return updatedDisplay;
      } catch (error) {
        const display = await createDisplay({
          roomId,
          name: displayName,
          isHost,
          cardValue,
        });
        return display;
      }
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['display', data.id], data);
      },
    }
  );
}

// function useResetCardValues({ roomName }: { roomName: string }) {
//   return useMutation(
//     ['room', roomName],
//     ({ displayData }: { displayData: Pick<DisplayWithId_Firebase, 'id' | 'cardValue'>[] }) =>
//       resetCardValues({ displayData, roomName })
//   );
// }

// function useSetRoomLabel({ roomName }: { roomName: string }) {
//   return useMutation(['room', roomName], (label: string) => setRoomLabel({ label, roomName }));
// }

function useCreateRoom() {
  return useMutation(
    async ({ roomName }: { roomName: string }) => {
      const createdRoom = await createRoom({ roomName });
      return createdRoom;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['room', data.id], data);
      },
    }
  );
}

function useGetRooms() {
  return useQuery<Room[]>(['room'], async () => {
    const roomsRaw = await getRooms();

    const rooms = roomsRaw.map((room) => ZodRoom.parse(room));
    return rooms;
  });
}

function useGetRoomById({ roomId }: { roomId: number }) {
  return useQuery<Room>(['room', roomId], async () => {
    const roomRaw = await getRoomById(roomId);

    const room = ZodRoom.parse(roomRaw);
    return room;
  });
}

function useUpdateRoom() {
  return useMutation(async ({ id, label, name }: Room) => {
    const roomRaw = await updateRoom({ id, label, name });

    return roomRaw;
  });
}

function useUpdateRoomDisplayCards() {
  return useMutation(async (id: number) => {
    const displays = await updateRoomDisplayCards(id);
    // TODO: Reset some state somewhere?

    return displays;
  });
}

export {
  useCreateRoom,
  useGetRooms,
  useGetRoomById,
  useUpdateRoom,
  useUpdateRoomDisplayCards,
  useGetRoomDisplays,
  useUpdateDisplay,
  useCreateOrUpdateDisplayByName,
};
export type { UpdateDisplayProps };
