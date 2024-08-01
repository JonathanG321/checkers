'use client';

import { useEffect, useState } from 'react';
import { CheckerBoard as CheckerBoardType, Player, Players } from '@/types';
import classNames from 'classnames';
import Image from 'next/image';
import boardBorder from '../../../public/board-border.jpg';
import boardEdge from '../../../public/board-edge.jpeg';
import blackSpace from '../../../public/black-space.jpeg';
import whiteSpace from '../../../public/white-space.jpeg';
import redPiece from '../../../public/red-piece.png';
import blackPiece from '../../../public/black-piece.png';

type Props = { board: CheckerBoardType; player: Player };

export default function CheckerBoard({ board, player }: Props) {
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
                <div key={i + j + space} className={classNames('h-16 w-16 relative')}>
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
