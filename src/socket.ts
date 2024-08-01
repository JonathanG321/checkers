'use client';

import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './server/socketTypes';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
