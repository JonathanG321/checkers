'use client';

import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { CheckerBoard as CheckerBoardType, Player, Players } from '@/types';
import { defaultBoard } from '@/constants';
import CheckerBoard from './components/CheckerBoard';

export default function Home() {
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [roomName, setRoomName] = useState<undefined | string>(undefined);
  const [occupants, setOccupants] = useState<Players>([undefined, undefined]);
  const currentPlayer = occupants.find((player) => player && player.id === socket.id);
  const [board, setBoard] = useState<CheckerBoardType>(processBoard(defaultBoard, currentPlayer));

  function onClick() {
    socket.emit('updateLastId');
  }

  function joinRoom() {
    socket.emit('joinRoom');
  }

  useEffect(() => {
    function onNewLastId(id: string) {
      setLastId(id);
    }
    function onUpdateRoomOccupants(newOccupants: Players) {
      setOccupants(newOccupants);
    }
    function onUpdateRoomName(name: string) {
      setRoomName(name);
    }
    function onUpdateRoomBoard(board: CheckerBoardType) {
      setBoard(processBoard(board, currentPlayer));
    }

    socket.on('newLastId', onNewLastId);
    socket.on('updateRoomOccupants', onUpdateRoomOccupants);
    socket.on('updateRoomName', onUpdateRoomName);
    socket.on('updateRoomBoard', onUpdateRoomBoard);
  }, [currentPlayer]);

  return (
    <div className="m-10 flex justify-center items-center">
      {!roomName && (
        <button onClick={joinRoom} className="p-2 border-1 bg-gray-800 text-white rounded">
          Join Room
        </button>
      )}
      {!!roomName && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{roomName}</h1>
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
          {currentPlayer && (
            <CheckerBoard board={board} player={currentPlayer} isYourTurn={true /* TODO: handle this properly */} />
          )}
        </div>
      )}
    </div>
  );
}

function processBoard(board: CheckerBoardType, currentPlayer: Player | undefined) {
  if (currentPlayer?.color === 'R' || !currentPlayer) {
    return board;
  }
  const reverseBoard = board.map((row) => row.reverse()).reverse() as CheckerBoardType;
  return reverseBoard;
}
