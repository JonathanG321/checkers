export type Color = 'B' | 'R';

export type CheckerSpace = ' ' | Color;

export type CheckerRow = [
  CheckerSpace,
  CheckerSpace,
  CheckerSpace,
  CheckerSpace,
  CheckerSpace,
  CheckerSpace,
  CheckerSpace,
  CheckerSpace
];

export type CheckerBoard = [
  CheckerRow,
  CheckerRow,
  CheckerRow,
  CheckerRow,
  CheckerRow,
  CheckerRow,
  CheckerRow,
  CheckerRow
];

export type Player = { id: string; color: Color };

export type Players = [Player | undefined, Player | undefined];

export type SpaceNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Coordinate = [SpaceNumber, SpaceNumber];

export type GameRoom = { players: Players; board: CheckerBoard; currentTurn: Color };
