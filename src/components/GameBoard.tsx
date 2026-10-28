import { Position } from '../hooks/useSnakeGame';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  gameOver: boolean;
}

export default function GameBoard({ snake, food, gridSize, gameOver }: GameBoardProps) {
  const snakeMap = new Map<string, number>();
  snake.forEach((seg, idx) => {
    snakeMap.set(`${seg.x},${seg.y}`, idx);
  });

  const cells: JSX.Element[] = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const key = `${x},${y}`;
      const snakeIdx = snakeMap.get(key);
      const isHead = snakeIdx === 0;
      const isSnake = snakeIdx !== undefined;
      const isFood = x === food.x && y === food.y;

      if (isHead) {
        cells.push(
          <div
            key={key}
            className="aspect-square rounded-md bg-emerald-400 shadow-lg shadow-emerald-400/50 scale-110 relative z-10 transition-all duration-75"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
            </div>
          </div>
        );
      } else if (isSnake) {
        const opacity = Math.max(0.35, 1 - (snakeIdx! / snake.length) * 0.65);
        cells.push(
          <div
            key={key}
            className={`aspect-square rounded-sm transition-all duration-75 ${gameOver ? 'opacity-40' : ''}`}
            style={{ backgroundColor: `rgba(52, 211, 153, ${opacity})` }}
          />
        );
      } else if (isFood) {
        cells.push(
          <div
            key={key}
            className="aspect-square rounded-full bg-red-400 shadow-lg shadow-red-400/50 animate-pulse scale-90"
          />
        );
      } else {
        cells.push(
          <div
            key={key}
            className="aspect-square rounded-sm bg-gray-800/20"
          />
        );
      }
    }
  }

  return (
    <div
      className="grid gap-[1px] bg-gray-900/50 p-1.5 md:p-2 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-2xl w-full h-full"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
}
