import { useUpdateDisplay } from '../hooks/roomsFastify.hooks';
import { useRoomDisplays } from '../providers/roomDisplays.provider';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Card from './Card';
import NameVoted from './NameVoted';
import PieData from './PieData';
import './Room.css';
import { Display } from 'planning-poker-types';

const cards = [1, 2, 3, 5, 8, 13, 21, 34, 55];

interface Card {
  number: number;
}

function NoRoomOrDisplay() {
  const navigate = useNavigate();

  function findRoom() {
    navigate('/');
  }

  return (
    <div>
      You must be logged in or authorized.{' '}
      <button onClick={findRoom}>Find Room</button>
    </div>
  );
}

function HasRoomAndDisplay({
  roomId,
  displayName,
}: {
  roomId: string;
  displayName: string;
}) {
  const parsedRoomId = parseInt(roomId);
  const { roomDisplays } = useRoomDisplays();
  const [currentDisplay, setCurrentDisplay] = useState<Display>();
  const displayMutation = useUpdateDisplay({ roomId: parsedRoomId });
  const displays = roomDisplays.displays;

  useEffect(() => {
    if (roomDisplays.displays) {
      const found = displays.find((display) => {
        return display.name === displayName;
      });
      if (found) {
        setCurrentDisplay(found);
      }
    }
  }, [roomDisplays, displayName]);

  function updateDisplayCardValue(number: number) {
    if (currentDisplay) {
      displayMutation.mutate({
        ...currentDisplay,
        cardValue: number,
      });
    }
  }

  function resetSelection() {
    if (currentDisplay) {
      displayMutation.mutate({
        ...currentDisplay,
        cardValue: 0,
      });
    }
  }

  const selectedNumber = currentDisplay?.cardValue;

  return (
    <>
      <div className='cards-wrapper'>
        {cards.map((number) => {
          return (
            <Card
              key={number}
              buttonDisabled={
                typeof selectedNumber === 'number' && selectedNumber > 0
              }
              number={number}
              onCardClick={updateDisplayCardValue}
              selectedNumber={selectedNumber}
            />
          );
        })}
      </div>

      {displays && <NameVoted />}

      {displays && <PieData />}

      <div className='reset-selection'>
        <button onClick={resetSelection}>Reset Selection</button>
      </div>
    </>
  );
}

export default function Room() {
  const { roomId } = useParams();
  const { state } = useLocation();

  if (!roomId || !state || (state && !state.displayName)) {
    return <NoRoomOrDisplay />;
  }

  return <HasRoomAndDisplay roomId={roomId!} displayName={state.displayName} />;
}
