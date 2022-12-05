import { useState, ChangeEvent, FormEvent } from 'react';
import {
  useCreateOrUpdateDisplayByName,
  useGetRoomById,
  useGetRoomDisplays,
} from '../hooks/roomsFastify.hooks';
import { useNavigate, useParams } from 'react-router-dom';

function DisplayList({ roomId }: { roomId: number }) {
  const { data: displays, isLoading, isError } = useGetRoomDisplays({ roomId });

  if (isLoading) {
    return <p>Loading rooms...</p>;
  } else if (isError || (!isLoading && !displays)) {
    return <p>Something went wrong getting the rooms...</p>;
  }

  return (
    <>
      <ul>
        {displays.map((display) => {
          return <li key={display.id}>{display.name}</li>;
        })}
      </ul>
    </>
  );
}

// TODO: add to route with `roomId` as route param
function DisplayLogin() {
  const [displayName, setDisplayName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [displayNameError, setDisplayNameError] = useState(false);
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const roomId = parseInt(params.roomId!);
  const createOrUpdateDisplayMutation = useCreateOrUpdateDisplayByName();
  const { data: room, isLoading, isError } = useGetRoomById({ roomId });

  const navigate = useNavigate();

  const displayNameExists = displayName && displayName.length > 0;

  function handleDisplayChange(
    event: ChangeEvent<HTMLInputElement> | undefined
  ) {
    if (event && event.target.value) {
      setDisplayName(event.target.value);
    }
  }

  function handleHost() {
    setIsHost(!isHost);
  }

  function handleFindOrCreateDisplay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayNameExists) {
      setDisplayNameError(true);
      return;
    }

    createOrUpdateDisplayMutation.mutate(
      { roomId, cardValue: 0, isHost, displayName },
      {
        onSuccess: () => {
          // TODO: Do I need to set this data returned?

          // TODO: change this to use ID not name.
          navigate('/room/' + roomId, {
            state: {
              displayName,
            },
          });
        },
      }
    );
  }

  return (
    <>
      <form
        onSubmit={handleFindOrCreateDisplay}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <label>
          Display Name:
          <input
            required
            type='text'
            value={displayName}
            onChange={handleDisplayChange}
          />
        </label>
        {displayNameError && (
          <span style={{ color: 'red' }}>Display Name is required</span>
        )}
        <label>
          Room Host:
          <input type='checkbox' checked={isHost} onChange={handleHost} />
        </label>
        <button disabled={!displayNameExists} type='submit'>
          Join room
        </button>

        {/* TODO: make into separate component? */}
        {isLoading || isError || (!isLoading && !room) ? (
          <p>Loading room displays</p>
        ) : (
          <>
            <h4>Current Display Names in {room.name}:</h4>
            <DisplayList roomId={roomId} />
          </>
        )}
      </form>
    </>
  );
}

export default DisplayLogin;
