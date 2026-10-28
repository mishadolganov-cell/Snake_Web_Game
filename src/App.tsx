import { useEffect, useRef, useCallback } from 'react';
import { useSnakeGame, Direction, Difficulty } from './hooks/useSnakeGame';
import GameBoard from './components/GameBoard';
import TouchControls from './components/TouchControls';

function App() {
  const {
    snake,
    food,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize,
    startGame,
    togglePause,
    resetGame,
    changeDirection,
    setDifficulty,
  } = useSnakeGame();

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        W: 'UP',
        s: 'DOWN',
        S: 'DOWN',
        a: 'LEFT',
        A: 'LEFT',
        d: 'RIGHT',
        D: 'RIGHT',
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        if (gameState === 'playing') {
          changeDirection(keyMap[e.key]);
        }
      }

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        } else {
          togglePause();
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, changeDirection, startGame, togglePause, resetGame]);

  // Prevent default touch behaviors on the game area
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('.game-area')) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, []);

  // Touch swipe controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 25;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      changeDirection(dy > 0 ? 'DOWN' : 'UP');
    }
    touchStartRef.current = null;
  }, [changeDirection]);

  const handleDifficultyChange = (d: Difficulty) => {
    if (gameState === 'idle' || gameState === 'gameover') {
      setDifficulty(d);
    }
  };

  const isNewHighScore = gameState === 'gameover' && score > 0 && score >= highScore;

  return (
    <div
      className="game-area min-h-[100dvh] h-[100dvh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center select-none overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top, 12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header - compact for mobile */}
      <div className="w-full max-w-[420px] px-4 pt-2 pb-1 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
          🐍 Snake
        </h1>

        {/* Score Board - compact */}
        <div className="flex justify-between items-center bg-gray-800/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-700/50">
          <div className="text-center flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Score</p>
            <p className="text-xl font-bold text-emerald-400">{score}</p>
          </div>
          <div className="text-center flex-1 border-x border-gray-700/30">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Best</p>
            <p className="text-xl font-bold text-amber-400">{highScore}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Length</p>
            <p className="text-xl font-bold text-cyan-400">{snake.length}</p>
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="flex gap-2 py-2 flex-shrink-0">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => handleDifficultyChange(d)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200
              ${difficulty === d
                ? d === 'easy'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/20'
                  : d === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/20'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
              }
              ${(gameState === 'playing' || gameState === 'paused') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={gameState === 'playing' || gameState === 'paused'}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Game Board Container - responsive sizing */}
      <div className="game-board-wrapper relative w-full max-w-[420px] flex-1 flex items-center justify-center px-3">
        <div className="w-full aspect-square max-h-[50vh] md:max-h-[60vh]">
          <GameBoard
            snake={snake}
            food={food}
            gridSize={gridSize}
            gameOver={gameState === 'gameover'}
          />
        </div>

        {/* Overlays */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/85 backdrop-blur-sm rounded-xl z-20 animate-fadeIn">
            <div className="text-5xl mb-3 animate-bounce-in">🐍</div>
            <p className="text-lg text-gray-200 font-semibold mb-1">Ready to Play?</p>
            <p className="text-xs text-gray-400 mb-3">Swipe or use buttons to control</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl
                transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40
                hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
            <p className="text-[10px] text-gray-500 mt-2 hidden md:block">or press Space</p>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/85 backdrop-blur-sm rounded-xl z-20 animate-fadeIn">
            <div className="text-4xl mb-3">⏸️</div>
            <p className="text-lg text-gray-200 font-semibold mb-3">Paused</p>
            <button
              onClick={togglePause}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl
                transition-all duration-200 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40
                hover:scale-105 active:scale-95"
            >
              Resume
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm rounded-xl z-20 animate-fadeIn">
            <div className="text-4xl mb-2">💀</div>
            <p className="text-xl text-red-400 font-bold mb-1">Game Over!</p>
            {isNewHighScore && (
              <p className="text-xs text-amber-400 font-semibold mb-1 animate-pulse">
                🏆 New High Score!
              </p>
            )}
            <p className="text-base text-gray-300 mb-3">Score: <span className="text-emerald-400 font-bold">{score}</span></p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl
                transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40
                hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons - compact */}
      <div className="flex gap-2 py-2 flex-shrink-0">
        {(gameState === 'playing' || gameState === 'paused') && (
          <button
            onClick={togglePause}
            className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 text-sm font-semibold rounded-xl
              transition-all duration-200 border border-gray-600/50 active:scale-95"
          >
            {gameState === 'paused' ? '▶ Resume' : '⏸ Pause'}
          </button>
        )}
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 text-sm font-semibold rounded-xl
            transition-all duration-200 border border-gray-600/50 active:scale-95"
        >
          ↺ Restart
        </button>
      </div>

      {/* Touch Controls - larger buttons for iPhone */}
      <TouchControls
        onDirection={changeDirection}
        disabled={gameState !== 'playing'}
      />

      {/* Controls hint - desktop only */}
      <div className="mt-1 text-center text-[10px] text-gray-500 hidden md:block flex-shrink-0">
        <p>Arrow Keys / WASD to move • Space to pause • R to restart</p>
      </div>
    </div>
  );
}

export default App;
