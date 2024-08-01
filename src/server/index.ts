import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { faker } from '@faker-js/faker';
import { Color, GameRoom, Player, Players } from '@/types';
import { defaultBoard } from '@/constants';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents } from './socketTypes';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const rooms: Record<string, GameRoom> = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(httpServer);

  io.on('connection', (socket) => {
    function joinRoom(roomName: string, occupants: Players) {
      socket.join(roomName);
      io.to(roomName).emit('updateRoomOccupants', occupants);
      io.to(roomName).emit('updateRoomName', roomName);
    }

    function addPlayerToRoom() {
      const roomToJoin = findRoomToJoin(rooms);

      if (roomToJoin) {
        const [roomName, room] = roomToJoin;
        rooms[roomName].players.push(createPlayer(socket.id, getNewColorForRoom(room)));
        joinRoom(roomName, room.players);
      } else {
        const players: Players = [createPlayer(socket.id, 'R'), undefined];
        const roomName = faker.word.words({ count: 5 }).split(' ').join('');
        rooms[roomName] = { players: players, board: defaultBoard };
        joinRoom(roomName, players);
      }
    }

    function removePlayerFromRoom() {
      const playersCurrentRoom = findPlayersCurrentRoom(socket.id);
      if (playersCurrentRoom) {
        const [roomName, room] = playersCurrentRoom;
        socket.leave(roomName);
        room.players = room.players.map((player) => (player?.id !== socket.id ? undefined : player)) as Players;
        io.to(roomName).emit('updateRoomOccupants', room.players);
      }
    }

    socket.on('joinRoom', (id: string | undefined) => {
      const playersCurrentRoom = findPlayersCurrentRoom(id);
      if (!!playersCurrentRoom) {
        return;
      }
      addPlayerToRoom();
    });

    socket.on('updateLastId', (id: string | undefined) => {
      const playersCurrentRoom = findPlayersCurrentRoom(id);
      if (!!playersCurrentRoom) {
        io.to(playersCurrentRoom[0]).emit('newLastId', id);
      }
    });

    socket.on('disconnecting', (reason) => {
      removePlayerFromRoom();
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

function findPlayersCurrentRoom(id: string | undefined) {
  return Object.entries(rooms).find(([_, room]) => room.players.some((player) => player && player.id === id));
}

function findRoomToJoin(rooms: Record<string, GameRoom>) {
  return Object.entries(rooms).find(([_, room]) => room.players.some((player) => player === undefined));
}

function createPlayer(id: string, color: Color): Player {
  return { id, color };
}

function getNewColorForRoom(room: GameRoom) {
  const playerInRoom = room.players.find((player) => player);
  let newColor: Color = 'R';
  if (!!playerInRoom) {
    newColor = playerInRoom.color === 'B' ? 'R' : 'B';
  }
  return newColor;
}
