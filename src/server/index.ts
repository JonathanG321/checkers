import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { faker } from '@faker-js/faker';
import { CheckerBoard, Color, GameRoom, Player, Players } from '@/types';
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
      io.to(roomName).emit('updateRoomBoard', defaultBoard);
    }

    function addPlayerToRoom(id: string) {
      const roomToJoinName = findRoomToJoin(rooms);

      if (roomToJoinName) {
        const emptyPlayerIndex = rooms[roomToJoinName].players.findIndex((player) => player === undefined);
        rooms[roomToJoinName].players[emptyPlayerIndex] = createPlayer(id, getNewColorForRoom(rooms[roomToJoinName]));
        joinRoom(roomToJoinName, rooms[roomToJoinName].players);
      } else {
        const players: Players = [createPlayer(id, 'R'), undefined];
        const roomName = faker.word.words({ count: 5 }).split(' ').join('');
        rooms[roomName] = { players: players, board: defaultBoard, currentTurn: 'R' };
        joinRoom(roomName, players);
      }
    }

    function removePlayerFromRoom() {
      const playersCurrentRoom = findPlayersCurrentRoom(socket.id);
      if (playersCurrentRoom) {
        const [roomName, room] = playersCurrentRoom;
        socket.leave(roomName);
        rooms[roomName].players = room.players.map((player) =>
          player?.id !== socket.id ? undefined : player
        ) as Players;
        io.to(roomName).emit('updateRoomOccupants', room.players);
      }
    }

    socket.on('joinRoom', () => {
      const playersCurrentRoom = findPlayersCurrentRoom(socket.id);
      if (!playersCurrentRoom && !!socket.id) {
        addPlayerToRoom(socket.id);
      }
    });

    socket.on('updateLastId', () => {
      const playersCurrentRoom = findPlayersCurrentRoom(socket.id);
      if (!!playersCurrentRoom) {
        io.to(playersCurrentRoom[0]).emit('newLastId', socket.id);
      }
    });

    socket.on('updateBoard', (newBoard) => {
      const playersCurrentRoom = findPlayersCurrentRoom(socket.id);
      if (!!playersCurrentRoom) {
        rooms[playersCurrentRoom[0]].board = newBoard;
        io.to(playersCurrentRoom[0]).emit('updateRoomBoard', newBoard);
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
  return Object.entries(rooms).find(([_, room]) => room.players.some((player) => player === undefined))?.[0];
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
