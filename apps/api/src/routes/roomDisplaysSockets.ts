import Websocket from 'ws';

let roomDisplaysSockets: Map<number, Websocket[]>;

function getRoomDisplaysSockets() {
  if (!roomDisplaysSockets) {
    roomDisplaysSockets = new Map<number, Websocket[]>();
  }

  return { roomDisplaysSockets };
}

export { getRoomDisplaysSockets };
