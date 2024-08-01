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

export type GameRoom = { players: Players; board: CheckerBoard };
