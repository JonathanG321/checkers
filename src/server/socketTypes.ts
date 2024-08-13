import { CheckerBoard, Players } from '@/types';

export type ServerToClientEvents = {
  updateRoomOccupants: (occupants: Players) => void;
  updateRoomName: (name: string) => void;
  updateRoomBoard: (board: CheckerBoard) => void;
  newLastId: (id: string) => void;
};

export type ClientToServerEvents = {
  updateLastId: () => void;
  joinRoom: () => void;
  updateBoard: (board: CheckerBoard) => void;
};

export type InterServerEvents = {};
