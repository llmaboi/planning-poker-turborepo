import {
  Display,
  DisplayRaw,
  ResponseData,
  Room,
  ZodDisplay,
  ZodDisplayRaw,
  ZodRoomRaw,
} from 'planning-poker-types';
import { connectAxios } from '../config/db';
import { displayRawToDisplay } from './helpers';

// TODO: Implement react-query in the hooks...
// TODO: add transformers.
async function getRoomDisplays(roomId: number): Promise<Display[]> {
  const { axiosInstance } = connectAxios();
  const roomDisplays = await axiosInstance.get<ResponseData<DisplayRaw[]>>(
    `/api/displays/room/${roomId}`
    // `${API_BASE}/displays/room/${roomId}`
  );

  const rawDisplays = roomDisplays.data.data.map((item) =>
    ZodDisplayRaw.parse(item)
  );
  const transformedDisplays = rawDisplays.map(displayRawToDisplay);
  return transformedDisplays;
}

let websocket: WebSocket;
const WEBSOCKET_BASE = import.meta.env.VITE_WEBSOCKET_URL;

function connectWebsocket(urlAddition: string) {
  if (!websocket) {
    websocket = new WebSocket(WEBSOCKET_BASE + urlAddition);
  }

  return { websocket };
}

function websocketRoomDisplays(
  roomId: number,
  setDisplays: (data: Display[]) => void
) {
  const { websocket } = connectWebsocket(`/api/displays/room/${roomId}/socket`);

  websocket.onmessage = (event) => {
    const json = JSON.parse(event.data);
    if (!json || (json && !json.data)) {
      console.log('No data to update...');
      return;
    }

    const { data }: { data: DisplayRaw[] } = json;

    const parsedDisplays = data.map((item) => ZodDisplayRaw.parse(item));
    // TODO: update provider...
    const transformedDisplays = parsedDisplays.map(displayRawToDisplay);
    setDisplays(transformedDisplays);
  };

  return { websocket };
}

async function getRoomByName(roomName: string): Promise<Room> {
  const { axiosInstance } = connectAxios();
  const roomDisplays = await axiosInstance.get<ResponseData<Room>>(
    '/api/rooms/name',
    {
      params: { name: roomName },
    }
  );

  const rawRoom = ZodRoomRaw.parse(roomDisplays.data.data);
  return rawRoom;
}

async function createRoom({
  roomName,
  roomLabel = '',
}: {
  roomName: string;
  roomLabel?: string;
}): Promise<Room> {
  const { axiosInstance } = connectAxios();
  const roomDisplays = await axiosInstance.post<ResponseData<Room>>(
    '/api/rooms',
    {
      name: roomName,
      label: roomLabel,
    }
  );

  const rawRoom = ZodRoomRaw.parse(roomDisplays.data.data);
  return rawRoom;
}

async function getRooms(): Promise<Room[]> {
  const { axiosInstance } = connectAxios();
  const { data: roomsData } = await axiosInstance.get<ResponseData<Room[]>>(
    '/api/rooms'
  );

  const rawRooms = roomsData.data.map((item) => ZodRoomRaw.parse(item));
  return rawRooms;
}

async function getRoomById(roomId: number): Promise<Room> {
  const { axiosInstance } = connectAxios();
  // const roomDisplays = await axiosInstance.get<ResponseData<Room>>(`${API_BASE}/rooms/${roomId}`);
  const roomDisplays = await axiosInstance.get<ResponseData<Room>>(
    `/api/rooms/${roomId}`
  );

  const rawRoom = ZodRoomRaw.parse(roomDisplays.data.data);
  return rawRoom;
}

async function getDisplayByName(
  displayName: string,
  roomId: number
): Promise<Display> {
  const { axiosInstance } = connectAxios();
  const displayDisplays = await axiosInstance.get<ResponseData<Display>>(
    '/api/displays/name',
    {
      params: { name: displayName, roomId: roomId },
    }
  );

  const rawDisplay = ZodDisplayRaw.parse(displayDisplays.data.data);
  const transformedDisplay = displayRawToDisplay(rawDisplay);
  return transformedDisplay;
}

async function createDisplay({
  roomId,
  name,
  cardValue = 0,
  isHost = false,
}: {
  roomId: number;
  name: string;
  cardValue?: number;
  isHost?: boolean;
}) {
  const { axiosInstance } = connectAxios();
  const displayDisplays = await axiosInstance.post<ResponseData<Display>>(
    '/api/displays',
    {
      roomId,
      name,
      cardValue,
      isHost,
    }
  );

  const rawDisplay = ZodDisplayRaw.parse(displayDisplays.data.data);
  const transformedDisplay = displayRawToDisplay(rawDisplay);
  return transformedDisplay;
}

async function updateDisplay({
  roomId,
  name,
  id,
  cardValue,
  isHost,
}: Display): Promise<Display> {
  const { axiosInstance } = connectAxios();
  const displayData = await axiosInstance.patch<ResponseData<DisplayRaw>>(
    `/api/displays/${id}`,
    // `${API_BASE}/displays/${id}`,
    {
      cardValue,
      roomId,
      name,
      isHost,
    }
  );

  const rawDisplay = ZodDisplayRaw.parse(displayData.data.data);
  const transformedDisplay = displayRawToDisplay(rawDisplay);
  return transformedDisplay;
}

async function updateRoom({ name, id, label }: Room): Promise<Room> {
  const { axiosInstance } = connectAxios();
  const roomData = await axiosInstance.patch<ResponseData<Room>>(
    `/api/rooms/${id}`,
    {
      label,
      name,
    }
  );

  const rawRoom = ZodRoomRaw.parse(roomData.data.data);
  return rawRoom;
}

async function updateRoomDisplayCards(id: number): Promise<Display[]> {
  const { axiosInstance } = connectAxios();
  const displaysData = await axiosInstance.patch<ResponseData<DisplayRaw[]>>(
    `/api/rooms/${id}/card-reset`
  );

  console.log('displaysData: ', displaysData);

  const displays = displaysData.data.data.map((display) =>
    displayRawToDisplay(ZodDisplayRaw.parse(display))
  );
  return displays;
}

export {
  createRoom,
  getRoomDisplays,
  getRooms,
  getRoomById,
  getRoomByName,
  createDisplay,
  getDisplayByName,
  updateDisplay,
  updateRoom,
  updateRoomDisplayCards,
  websocketRoomDisplays,
};
