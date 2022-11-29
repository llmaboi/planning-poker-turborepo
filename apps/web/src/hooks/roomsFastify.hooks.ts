import {
  createDisplay,
  createRoom,
  getDisplayByName,
  getRoomByName,
  getRoomDisplays,
  updateDisplay,
} from '../api/mysqlFastify';
import { queryClient } from '../config/queryClient';
import { useMutation, useQuery } from 'react-query';

function useGetRoomDisplays({ roomId }: { roomId: number }) {
  return useQuery(['room', roomId], async () => getRoomDisplays(roomId));
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

function useCreateOrFindDisplayByName() {
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
    }) => {
      try {
        const display = await getDisplayByName(displayName);

        return display;
      } catch (error) {
        const createdDisplay = await createDisplay({
          roomId,
          name: displayName,
          isHost,
          cardValue,
        });
        return createdDisplay;
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

function useCreateOrFindRoomByName() {
  return useMutation(
    async ({ roomName }: { roomName: string }) => {
      try {
        const room = await getRoomByName(roomName);

        return room;
      } catch (error) {
        const createdRoom = await createRoom({ roomName });
        return createdRoom;
      }
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['room', data.id], data);
      },
    }
  );
}

export {
  useGetRoomDisplays,
  useUpdateDisplay,
  useCreateOrFindRoomByName,
  useCreateOrFindDisplayByName,
};
export type { UpdateDisplayProps };
