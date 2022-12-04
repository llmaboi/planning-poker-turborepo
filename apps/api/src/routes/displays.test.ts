// import WebSocket from 'ws';
// import { getEnvConfig } from '../config/env';
import { DisplayRaw, ZodDisplayRaw } from 'planning-poker-types';
import { testServer } from '../config/setupTests';

describe('Route: /displays/room/:id', () => {
  describe('get displays by room id', () => {
    test('returns 200 and display data', async () => {
      const response = await testServer.inject({
        method: 'GET',
        url: '/api/displays/room/1',
      });

      expect(response.statusCode).toEqual(200);
      const { data } = response.json<{ data: DisplayRaw[] }>();
      expect(data.length).toBeGreaterThan(0);
      const { success } = ZodDisplayRaw.safeParse(data[0]);
      expect(success).toBeTruthy();
      return Promise.resolve();
    });
  });
});

describe('Route: /displays/:id', () => {
  describe('get a display by id', () => {
    test('returns 200 and display data', async () => {
      const response = await testServer.inject({
        method: 'GET',
        url: '/api/displays/1',
      });

      expect(response.statusCode).toEqual(200);
      const { data } = response.json<{ data: DisplayRaw }>();
      const { success } = ZodDisplayRaw.safeParse(data);
      expect(success).toBeTruthy();
      return Promise.resolve();
    });
  });

  describe('create or update a display by id', () => {
    test('returns 200 and display data for creation and updating', async () => {
      const testDisplay: Omit<DisplayRaw, 'id'> = {
        name: 'Wazzo',
        room_id: 12333445566,
        card_value: 3,
        is_host: 0,
      };

      const createResponse = await testServer.inject({
        method: 'POST',
        url: '/api/displays',
        payload: {
          roomId: testDisplay.room_id,
          name: testDisplay.name,
          cardValue: testDisplay.card_value,
          isHost: testDisplay.is_host === 1,
        },
      });

      console.log(createResponse.json());
      expect(createResponse.statusCode).toEqual(200);
      const { data: createData } = createResponse.json<{ data: DisplayRaw }>();
      const { success: createSuccess } = ZodDisplayRaw.safeParse(createData);
      expect(createSuccess).toBeTruthy();
      expect(testDisplay.name).toEqual(createData.name);
      expect(testDisplay.room_id).toEqual(createData.room_id);

      const newDisplay: Omit<DisplayRaw, 'id'> = {
        name: 'Updated Wazzo',
        room_id: 11111999999,
        card_value: 3,
        is_host: 0,
      };
      const updateResponse = await testServer.inject({
        method: 'PATCH',
        url: '/api/displays/' + createData.id.toString(),
        payload: {
          roomId: newDisplay.room_id,
          name: newDisplay.name,
          cardValue: newDisplay.card_value,
          isHost: newDisplay.is_host === 1,
        },
      });

      expect(updateResponse.statusCode).toEqual(200);
      const { data: updateData } = updateResponse.json<{ data: DisplayRaw }>();
      const { success } = ZodDisplayRaw.safeParse(updateData);
      expect(success).toBeTruthy();
      expect(newDisplay.name).toEqual(updateData.name);
      expect(newDisplay.room_id).toEqual(updateData.room_id);
    });

    test('returns 500 when creating with invalid data', async () => {
      const createResponse = await testServer.inject({
        method: 'POST',
        url: '/api/displays',
        payload: { roomId: '123', name: 'Wazzo' },
      });
      expect(createResponse.statusCode).toEqual(500);
    });

    test('returns 500 when updating with invalid data', async () => {
      const updateResponse = await testServer.inject({
        method: 'PATCH',
        url: '/api/displays/' + '4',
        payload: { roomId: '1', name: 'nopers' },
      });

      expect(updateResponse.statusCode).toEqual(500);
    });
  });
});

// type WebSocketReadyState =
//   | typeof WebSocket.CONNECTING
//   | typeof WebSocket.OPEN
//   | typeof WebSocket.CLOSING
//   | typeof WebSocket.CLOSED;

// // TODO: Move me...
// function waitForSocketState(socket: WebSocket, state: WebSocketReadyState) {
//   return new Promise<void>((resolve) => {
//     setTimeout(() => {
//       if (socket.readyState === state) {
//         resolve();
//       } else {
//         void waitForSocketState(socket, state).then(resolve);
//       }
//     }, 10);
//   });
// }

// describe.only('gets websocket data on updates', () => {
//   test('On create websocket sends all displays including created display', async () => {
//     const envConfig = getEnvConfig();
//     // const client = new WebSocket(`ws://${envConfig.DB_HOST}:${envConfig.DB_PORT}/api/displays/room/1/socket`);
//     const client = await testServer.inject(`ws://${envConfig.DB_HOST}:${envConfig.DB_PORT}/api/displays/room/1/socket`);
//     console.log('client: ', client.raw.res.socket);
//     await waitForSocketState(client.socket[0], client.OPEN);

//     const testDisplay: Omit<DisplayRaw, 'id'> = {
//       name: 'Wazzo',
//       room_id: 12333445566,
//     };

//     const createResponse = await testServer.inject({
//       method: 'POST',
//       url: '/api/displays',
//       payload: { roomId: testDisplay.room_id, name: testDisplay.name },
//     });

//     console.log('createResponse: ', createResponse);

//     client.on('message', (data) => {
//       console.log('data: ', data);
//       client.close();
//     });

//     await waitForSocketState(client, client.CLOSED);
//   });

//   test('On update websocket sends all displays including updated display', async () => {
//     //
//   });
// });
