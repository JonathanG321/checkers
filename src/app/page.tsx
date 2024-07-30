'use client';

import { useEffect, useState } from 'react';
import { socket } from '../socket';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');
  const [lastId, setLastId] = useState('');
  const [room, setRoom] = useState('');
  const [occupants, setOccupants] = useState<string[]>([]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on('upgrade', (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport('N/A');
    }

    function onNewLastId(id: string) {
      setLastId(id);
    }

    function onUpdateRoomOccupants(newOccupants: string[]) {
      setOccupants(newOccupants);
    }
    function onUpdateRoomName(name: string) {
      setRoom(name);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('newLastId', onNewLastId);
    socket.on('updateRoomOccupants', onUpdateRoomOccupants);
    socket.on('updateRoomName', onUpdateRoomName);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  function onClick() {
    socket.emit('updateLastId', socket.id);
  }

  return (
    <div className="m-10">
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Transport: {transport}</p>
      <p>Last Id: {lastId}</p>
      <button onClick={onClick} disabled={lastId === socket.id} className="p-2 border-1 bg-gray-800 text-white rounded">
        Update Last ID
      </button>
      <div className="flex flex-col">
        <h1>{room}</h1>
        {occupants.map((occupant) => (
          <div key={occupant} className="p-1">
            {occupant}
          </div>
        ))}
      </div>
    </div>
  );
}
