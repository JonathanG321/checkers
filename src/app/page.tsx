'use client';

import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { CheckerBoard as CheckerBoardType, Player, Players } from '@/types';
import { defaultBoard } from '@/constants';
import CheckerBoard from './components/CheckerBoard';

export default function Home() {
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [room, setRoom] = useState<undefined | string>(undefined);
  const [occupants, setOccupants] = useState<Players>([undefined, undefined]);
  const [board, setBoard] = useState<CheckerBoardType>(defaultBoard);

  const currentPlayer = occupants.find((player) => player && player.id === socket.id);

  function onClick() {
    socket.emit('updateLastId', socket.id);
  }

  function joinRoom() {
    socket.emit('joinRoom', socket.id);
  }

  useEffect(() => {
    function onNewLastId(id: string | undefined) {
      setLastId(id);
    }
    function onUpdateRoomOccupants(newOccupants: Players) {
      setOccupants(newOccupants);
    }
    function onUpdateRoomName(name: string) {
      setRoom(name);
    }

    socket.on('newLastId', onNewLastId);
    socket.on('updateRoomOccupants', onUpdateRoomOccupants);
    socket.on('updateRoomName', onUpdateRoomName);
  }, []);

  return (
    <div className="m-10 flex justify-center items-center">
      {!room && (
        <button onClick={joinRoom} className="p-2 border-1 bg-gray-800 text-white rounded">
          Join Room
        </button>
      )}
      {!!room && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{room}</h1>
            <p>Last Id: {lastId}</p>
            <div className="flex flex-col border border-white p-2">
              <h2 className="text-xl font-bold">Occupants</h2>
              {occupants
                .filter((occupant): occupant is Player => !!occupant)
                .map((occupant) => (
                  <div key={occupant.id}>{occupant.id}</div>
                ))}
            </div>
          </div>
          <button
            onClick={onClick}
            disabled={lastId === socket.id}
            className="p-2 border text-white rounded border-white disabled:bg-gray-800 disabled:text-gray-300"
          >
            Update Last ID
          </button>
          {currentPlayer && <CheckerBoard board={board} player={currentPlayer} />}
        </div>
      )}
    </div>
  );
}
