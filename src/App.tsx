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
    const minSwipe = 30;

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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
          🐍 Snake Game
        </h1>

        {/* Score Board */}
        <div className="flex justify-between items-center bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-700/50">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Score</p>
            <p className="text-2xl font-bold text-emerald-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Best</p>
            <p className="text-2xl font-bold text-amber-400">{highScore}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Length</p>
            <p className="text-2xl font-bold text-cyan-400">{snake.length}</p>
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="flex gap-2 mb-4">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => handleDifficultyChange(d)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200
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

      {/* Game Board Container */}
      <div className="relative w-full max-w-lg aspect-square">
        <GameBoard
          snake={snake}
          food={food}
          gridSize={gridSize}
          gameOver={gameState === 'gameover'}
        />

        {/* Overlays */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl z-20">
            <div className="text-6xl mb-4 animate-bounce">🐍</div>
            <p className="text-xl text-gray-200 font-semibold mb-2">Ready to Play?</p>
            <p className="text-sm text-gray-400 mb-4">Use arrow keys or swipe to control</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl
                transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40
                hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
            <p className="text-xs text-gray-500 mt-3">or press Space</p>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl z-20">
            <div className="text-5xl mb-4">⏸️</div>
            <p className="text-xl text-gray-200 font-semibold mb-4">Paused</p>
            <button
              onClick={togglePause}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl
                transition-all duration-200 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40
                hover:scale-105 active:scale-95"
            >
              Resume
            </button>
            <p className="text-xs text-gray-500 mt-3">or press Space</p>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/85 backdrop-blur-sm rounded-xl z-20 animate-fadeIn">
            <div className="text-5xl mb-3">💀</div>
            <p className="text-2xl text-red-400 font-bold mb-1">Game Over!</p>
            {isNewHighScore && (
              <p className="text-sm text-amber-400 font-semibold mb-2 animate-pulse">
                🏆 New High Score!
              </p>
            )}
            <p className="text-lg text-gray-300 mb-4">Score: <span className="text-emerald-400 font-bold">{score}</span></p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl
                transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40
                hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
            <p className="text-xs text-gray-500 mt-3">or press Space</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        {(gameState === 'playing' || gameState === 'paused') && (
          <button
            onClick={togglePause}
            className="px-5 py-2 bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 font-semibold rounded-xl
              transition-all duration-200 border border-gray-600/50 hover:scale-105 active:scale-95"
          >
            {gameState === 'paused' ? '▶ Resume' : '⏸ Pause'}
          </button>
        )}
        <button
          onClick={resetGame}
          className="px-5 py-2 bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 font-semibold rounded-xl
            transition-all duration-200 border border-gray-600/50 hover:scale-105 active:scale-95"
        >
          ↺ Restart
        </button>
      </div>

      {/* Touch Controls (mobile only) */}
      <TouchControls
        onDirection={changeDirection}
        disabled={gameState !== 'playing'}
      />

      {/* Controls hint */}
      <div className="mt-4 text-center text-xs text-gray-500 hidden md:block">
        <p>Arrow Keys / WASD to move • Space to pause • R to restart</p>
      </div>
    </div>
  );
}

export default App;
