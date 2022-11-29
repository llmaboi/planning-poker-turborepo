import { Display, DisplayRaw } from 'planning-poker-types';

function displayRawToDisplay({
  card_value,
  is_host,
  room_id,
  ...rest
}: DisplayRaw): Display {
  return {
    ...rest,
    cardValue: card_value,
    isHost: is_host === 1,
    roomId: room_id,
  };
}

export { displayRawToDisplay };
