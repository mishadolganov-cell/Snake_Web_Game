import { Direction } from '../hooks/useSnakeGame';

interface TouchControlsProps {
  onDirection: (dir: Direction) => void;
  disabled: boolean;
}

export default function TouchControls({ onDirection, disabled }: TouchControlsProps) {
  const handleTouch = (e: React.TouchEvent | React.MouseEvent, dir: Direction) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled) {
      onDirection(dir);
    }
  };

  const btnClass = `w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold
    bg-gray-800/80 border border-gray-600/50 text-gray-200
    active:scale-90 active:bg-emerald-600/30 transition-all duration-100
    select-none touch-manipulation shadow-lg backdrop-blur-sm
    ${disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`;

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48 mx-auto mt-4 md:hidden">
      <div />
      <button
        className={btnClass}
        onTouchStart={(e) => handleTouch(e, 'UP')}
        onClick={(e) => handleTouch(e, 'UP')}
        aria-label="Move Up"
      >
        ↑
      </button>
      <div />
      <button
        className={btnClass}
        onTouchStart={(e) => handleTouch(e, 'LEFT')}
        onClick={(e) => handleTouch(e, 'LEFT')}
        aria-label="Move Left"
      >
        ←
      </button>
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-gray-700/50" />
      </div>
      <button
        className={btnClass}
        onTouchStart={(e) => handleTouch(e, 'RIGHT')}
        onClick={(e) => handleTouch(e, 'RIGHT')}
        aria-label="Move Right"
      >
        →
      </button>
      <div />
      <button
        className={btnClass}
        onTouchStart={(e) => handleTouch(e, 'DOWN')}
        onClick={(e) => handleTouch(e, 'DOWN')}
        aria-label="Move Down"
      >
        ↓
      </button>
      <div />
    </div>
  );
}
