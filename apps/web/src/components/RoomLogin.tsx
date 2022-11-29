import { useCreateOrFindRoomByName } from '../hooks/roomsFastify.hooks';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

function RoomLogin() {
  const [roomName, setRoomName] = useState('');
  const [roomNameError, setRoomNameError] = useState(false);
  const roomNameQuery = useCreateOrFindRoomByName();
  const navigate = useNavigate();

  const roomNameExists = roomName && roomName.length > 0;

  function handleRoomNameChange(
    event: ChangeEvent<HTMLInputElement> | undefined
  ) {
    if (event && event.target.value) {
      setRoomName(event.target.value);
    }
  }

  function handleCreateOrFindRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roomNameExists) {
      setRoomNameError(true);
      return;
    }
    setRoomNameError(false);
    roomNameQuery.mutate(
      { roomName },
      {
        onSuccess: (data) => {
          // TODO:
          console.log(data);
          navigate('/' + data.id, {
            //             state: {
            //               displayName,
            //             },
            //           });
          });
        },
      }
    );
  }

  return (
    <form
      onSubmit={handleCreateOrFindRoom}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <label>
        Room Name:{' '}
        <input
          required
          type='text'
          value={roomName}
          onChange={handleRoomNameChange}
        />
      </label>
      {roomNameError && (
        <span style={{ color: 'red' }}>Room Name is required</span>
      )}
      <button disabled={!roomNameExists} type='submit'>
        Find room
      </button>
    </form>
  );
}

export default RoomLogin;
