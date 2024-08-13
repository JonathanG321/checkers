'use client';

import { useEffect, useState } from 'react';
import {
  CheckerBoard as CheckerBoardType,
  CheckerRow,
  CheckerSpace,
  Color,
  Coordinate,
  Player,
  Players,
  SpaceNumber,
} from '@/types';
import classNames from 'classnames';
import Image from 'next/image';
import boardBorder from '../../../public/board-border.jpg';
import boardEdge from '../../../public/board-edge.jpeg';
import blackSpace from '../../../public/black-space.jpeg';
import whiteSpace from '../../../public/white-space.jpeg';
import redPiece from '../../../public/red-piece.png';
import blackPiece from '../../../public/black-piece.png';
import { socket } from '@/socket';

type Props = { board: CheckerBoardType; player: Player; isYourTurn: boolean };

export default function CheckerBoard({ board, player, isYourTurn }: Props) {
  const [selectedPiece, setSelectedPiece] = useState<undefined | Coordinate>(undefined);
  return (
    <div className="relative p-10">
      <Image
        className="w-full h-full overflow-hidden rounded-xl"
        src={boardBorder}
        fill
        alt="CheckerBoard Border Background"
      />
      <div className="relative">
        <Image className="w-full h-full overflow-hidden" src={boardEdge} fill alt="CheckerBoard Edge Background" />
        <div className="p-1 grid grid-cols-8 gap-1 z-10 overflow-auto">
          {board.map((row, i) =>
            row.map((space, j) => {
              const isWhite = (i % 2 === 0 && j % 2 === 0) || (i % 2 === 1 && j % 2 === 1);
              return (
                <div
                  key={i + j + space}
                  className="h-16 w-16 relative cursor-pointer"
                  onClick={() => {
                    if (!isYourTurn) {
                      return;
                    }
                    if (board[i][j] === player.color && selectedPiece?.[0] === i && selectedPiece?.[1] === j) {
                      setSelectedPiece(undefined);
                    } else if (board[i][j] === player.color) {
                      setSelectedPiece([i as SpaceNumber, j as SpaceNumber]);
                    } else if (board[i][j] === ' ' && !!selectedPiece) {
                      const newBoard = getNewBoard(board, player.color, selectedPiece, [i, j] as Coordinate);
                      socket.emit('updateBoard', newBoard);
                      setSelectedPiece(undefined);
                    }
                  }}
                >
                  {selectedPiece?.[0] === i && selectedPiece?.[1] === j && (
                    <div className="absolute w-full h-full overflow-hidden border-4 border-teal-400 z-50" />
                  )}
                  <Image
                    className="absolute w-full h-full overflow-hidden"
                    width={1000}
                    height={1000}
                    src={isWhite ? whiteSpace : blackSpace}
                    alt="CheckerBoard Space Background"
                  />
                  {space !== ' ' && (
                    <Image
                      className="absolute w-full h-full overflow-hidden"
                      width={1000}
                      height={1000}
                      src={space === 'B' ? blackPiece : redPiece}
                      alt="CheckerBoard Space Background"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function getNewBoard(
  board: CheckerBoardType,
  color: Color,
  oldSpace: Coordinate,
  newSpace: Coordinate
): CheckerBoardType {
  const newBoard = board.map(
    (row, i): CheckerRow =>
      row.map((space, j): CheckerSpace => {
        const isOldSpace = i === oldSpace[0] && j === oldSpace[1];
        const isNewSpace = i === newSpace[0] && j === newSpace[1];
        if (isOldSpace) {
          return ' ';
        } else if (isNewSpace) {
          return color;
        }
        return space;
      }) as CheckerRow
  ) as CheckerBoardType;

  if (color === 'B') {
    return newBoard.map((row) => row.reverse()).reverse() as CheckerBoardType;
  }

  return newBoard;
}
