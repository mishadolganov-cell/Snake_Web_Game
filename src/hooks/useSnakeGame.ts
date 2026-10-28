import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

const GRID_SIZE = 20;

const SPEED_MAP: Record<Difficulty, number> = {
  easy: 180,
  medium: 120,
  hard: 70,
};

function getRandomPosition(snake: Position[]): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function getInitialSnake(): Position[] {
  const mid = Math.floor(GRID_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

export function useSnakeGame() {
  const [snake, setSnake] = useState<Position[]>(getInitialSnake());
  const [food, setFood] = useState<Position>(() => getRandomPosition(getInitialSnake()));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [highScore, setHighScore] = useState<number>(() => {
    const stored = localStorage.getItem('snake-high-score');
    return stored ? parseInt(stored, 10) : 0;
  });

  const directionRef = useRef<Direction>(direction);
  const gameStateRef = useRef<GameState>(gameState);
  const gameLoopRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const resetGame = useCallback(() => {
    const initialSnake = getInitialSnake();
    setSnake(initialSnake);
    setFood(getRandomPosition(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameState('idle');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    if (gameState === 'gameover' || gameState === 'idle') {
      resetGame();
      setTimeout(() => setGameState('playing'), 0);
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState, resetGame]);

  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    }
  }, [gameState]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = directionRef.current;
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    if (opposites[newDir] !== current) {
      setDirection(newDir);
      directionRef.current = newDir;
    }
  }, []);

  // Check and update high score
  const checkHighScore = useCallback((currentScore: number) => {
    setHighScore(prev => {
      if (currentScore > prev) {
        localStorage.setItem('snake-high-score', String(currentScore));
        return currentScore;
      }
      return prev;
    });
  }, []);

  // Game loop using requestAnimationFrame
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const speed = SPEED_MAP[difficulty];

    const gameLoop = (timestamp: number) => {
      if (gameStateRef.current !== 'playing') return;

      if (timestamp - lastMoveTimeRef.current >= speed) {
        lastMoveTimeRef.current = timestamp;

        setSnake(prevSnake => {
          const head = { ...prevSnake[0] };
          const dir = directionRef.current;

          switch (dir) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
          }

          // Wall collision
          if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            setGameState('gameover');
            return prevSnake;
          }

          // Self collision
          if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
            setGameState('gameover');
            return prevSnake;
          }

          const newSnake = [head, ...prevSnake];

          // Check food
          setFood(prevFood => {
            if (head.x === prevFood.x && head.y === prevFood.y) {
              setScore(s => {
                const newScore = s + 10;
                return newScore;
              });
              const newFood = getRandomPosition(newSnake);
              return newFood;
            } else {
              newSnake.pop();
              return prevFood;
            }
          });

          return newSnake;
        });
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, difficulty]);

  // Update high score when game ends
  useEffect(() => {
    if (gameState === 'gameover') {
      checkHighScore(score);
    }
  }, [gameState, score, checkHighScore]);

  return {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize: GRID_SIZE,
    startGame,
    pauseGame,
    togglePause,
    resetGame,
    changeDirection,
    setDifficulty,
  };
}
