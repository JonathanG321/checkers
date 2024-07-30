import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { faker } from '@faker-js/faker';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

type Room = { players: string[] };

const rooms: Record<string, Room> = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    function joinRoom(roomName: string, occupants: string[]) {
      socket.join(roomName);
      io.to(roomName).emit('updateRoomOccupants', occupants);
      io.to(roomName).emit('updateRoomName', roomName);
    }

    function addPlayerToRoom() {
      const roomToJoin = findRoomToJoin();

      if (roomToJoin) {
        const [roomName, room] = roomToJoin;
        rooms[roomName].players.push(socket.id);
        joinRoom(roomName, room.players);
      } else {
        const roomName = faker.word.words({ count: 5 }).split(' ').join('');
        rooms[roomName] = { players: [socket.id] };
        joinRoom(roomName, [socket.id]);
      }
    }

    function removePlayerFromRoom() {
      const playersCurrentRoom = findPlayersCurrentRoom(socket.id);
      if (playersCurrentRoom) {
        const [roomName, room] = playersCurrentRoom;
        socket.leave(roomName);
        room.players = room.players.filter((player) => player !== socket.id);
        io.to(roomName).emit('updateRoomOccupants', room.players);
      }
    }

    socket.on('joinRoom', (id: string) => {
      const playersCurrentRoom = findPlayersCurrentRoom(id);
      if (!!playersCurrentRoom) {
        return;
      }
      addPlayerToRoom();
    });

    socket.on('updateLastId', (id: string) => {
      const playersCurrentRoom = findPlayersCurrentRoom(id);
      if (playersCurrentRoom) {
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

function findPlayersCurrentRoom(id: string) {
  return Object.entries(rooms).find(([_, room]) => room.players.includes(id));
}

function findRoomToJoin() {
  return Object.entries(rooms).find(([_, room]) => room.players.length < 2);
}
