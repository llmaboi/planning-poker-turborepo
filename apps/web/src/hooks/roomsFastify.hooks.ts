import {
  createDisplay,
  createRoom,
  getDisplayByName,
  getRoomById,
  getRoomByName,
  getRoomDisplays,
  getRooms,
  updateDisplay,
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
    const displaysData = await getRoomDisplays(roomId);

    const displays = displaysData.map((displayRaw) =>
      displayRawToDisplay(displayRaw)
    );

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
    ({ id, cardValue, isHost, name }: UpdateDisplayProps) =>
      updateDisplay({ roomId, id, cardValue, isHost, name }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['display', data.id], data);
      },
    }
  );
}

function useFindOrCreateDisplayByName() {
  return useMutation(
    async ({
      displayName,
      roomId,
      cardValue,
      isHost,
    }: {
      displayName: string;
      roomId: number;
      cardValue?: number;
      isHost?: boolean;
    }): Promise<Display> => {
      try {
        const displayRaw = await getDisplayByName(displayName);
        const display = displayRawToDisplay(displayRaw);
        return display;
      } catch (error) {
        const createdDisplay = await createDisplay({
          roomId,
          name: displayName,
          isHost,
          cardValue,
        });
        const display = displayRawToDisplay(createdDisplay);
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

export {
  useCreateRoom,
  useGetRooms,
  useGetRoomById,
  useGetRoomDisplays,
  useUpdateDisplay,
  useFindOrCreateDisplayByName,
};
export type { UpdateDisplayProps };
