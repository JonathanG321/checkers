import { Players } from '@/types';

export type ServerToClientEvents = {
  updateRoomOccupants: (occupants: Players) => void;
  updateRoomName: (name: string) => void;
  newLastId: (id: string | undefined) => void;
};

export type ClientToServerEvents = {
  updateLastId: (id: string | undefined) => void;
  joinRoom: (id: string | undefined) => void;
};

export type InterServerEvents = {};
