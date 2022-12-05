// import { connectFirebase } from '@/config/db';
// import { useResetCardValues, useSetRoomLabel } from '@/hooks/roomsFirebase.hooks';
import { useRoomDisplays } from '../providers/roomDisplays.provider';
// import { DisplayWithId_Firebase } from '../providers/types';
import { ChangeEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Display, Room } from 'planning-poker-types';
import {
  useGetRoomById,
  useUpdateRoom,
  useUpdateRoomDisplayCards,
} from '../hooks/roomsFastify.hooks';
import './Header.css';

function HostHeader({ room }: { room: Room }) {
  const resetCardValuesMutation = useUpdateRoomDisplayCards();
  const updateRoomLabel = useUpdateRoom();
  const [label, setLabel] = useState(room.label || '');

  let displayNames: string[] = [];

  function resetCardData() {
    // TODO: write simpler FN to reset room cards...
    resetCardValuesMutation.mutate(room.id);
  }

  function handleLabelChange(event: ChangeEvent<HTMLInputElement>) {
    const newLabel = event.target.value;
    setLabel(newLabel);
  }

  function updateLabel() {
    if (!label || !label.length) {
      // TODO: make component with "reset"
      console.error('invalid label');
      return <p>An invalid label was provided</p>;
    }

    updateRoomLabel.mutate({ ...room, label });
  }

  return (
    <>
      <label id='room-label'>
        Room Label:{' '}
        <input
          disabled={updateRoomLabel.isLoading}
          type='text'
          value={label}
          onChange={handleLabelChange}
        />
      </label>

      <button disabled={updateRoomLabel.isLoading} onClick={updateLabel}>
        Update label
      </button>

      <button
        disabled={resetCardValuesMutation.isLoading}
        onClick={resetCardData}
      >
        Reset card data
      </button>
    </>
  );
}

function Header() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const parsedRoomId = parseInt(roomId!);
  const {
    data: room,
    isLoading,
    isError,
  } = useGetRoomById({ roomId: parsedRoomId });
  const { roomDisplays } = useRoomDisplays();
  const { state } = useLocation();
  const [isHost, setIsHost] = useState(false);
  const displaysData = roomDisplays.displays;

  useEffect(() => {
    if (displaysData) {
      const found = displaysData.find(
        (display) => display.name === state.displayName
      );

      if (found) {
        if (found.isHost) {
          setIsHost(found.isHost);
        }
      }
    }
  }, [displaysData, state.displayName]);

  if (!parsedRoomId || !state || (state && !state.displayName)) {
    navigate('/noAuth');
    // TODO: Correct this...
    return <div>Routing to No Auth...</div>;
  }

  // TODO: Move this to a common header...
  function signOut() {
    // TODO: Does state need to be reset?
    navigate('/noAuth');
    // TODO: Correct this...
    return <div>Routing to No Auth...</div>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError || (!isLoading && !room)) {
    // TODO: add button to try again?
    return <p>Something went wrong...</p>;
  }

  return (
    <div id='header-wrapper'>
      {isHost && <HostHeader room={room} />}
      {!isHost && (
        <>Room Label: {room && room.label ? room.label : 'No room label'}</>
      )}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

export default Header;
