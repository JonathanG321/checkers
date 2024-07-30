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

type Room = { name: string; players: string[] };

const rooms: Room[] = [];

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    socket.on('updateLastId', (id: string) => {
      const room = rooms.find((room) => room.players.includes(id));
      if (room) {
        io.to(room.name).emit('newLastId', id);
      }
    });

    const roomToJoin = rooms.find((room) => room.players.length < 2);
    if (roomToJoin) {
      rooms.forEach((room) => {
        if (room.name === roomToJoin.name) {
          room.players.push(socket.id);
        }
      });
      socket.join(roomToJoin.name);
      io.to(roomToJoin.name).emit('updateRoomOccupants', roomToJoin.players);
      io.to(roomToJoin.name).emit('updateRoomName', roomToJoin.name);
    } else {
      const roomName = faker.word.words({ count: 5 }).split(' ').join('');
      rooms.push({ name: roomName, players: [socket.id] });
      socket.join(roomName);
      io.to(roomName).emit('updateRoomOccupants', [socket.id]);
      io.to(roomName).emit('updateRoomName', roomName);
    }

    socket.on('disconnect', (reason) => {
      rooms.forEach((room) => {
        if (room.players.includes(socket.id)) {
          socket.leave(room.name);
          room.players = room.players.filter((player) => player !== socket.id);
        }
      });
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
