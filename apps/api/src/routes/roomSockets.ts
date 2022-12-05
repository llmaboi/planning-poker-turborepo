import Websocket from 'ws';

let roomSockets: Map<number, Websocket[]>;

function getRoomSockets() {
  if (!roomSockets) {
    roomSockets = new Map<number, Websocket[]>();
  }

  return { roomSockets };
}

export { getRoomSockets };
