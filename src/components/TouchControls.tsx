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

  const btnClass = `w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold
    bg-gray-800/90 border border-gray-600/50 text-gray-200
    active:scale-90 active:bg-emerald-600/30 active:border-emerald-500/50
    transition-all duration-75 select-none touch-manipulation
    shadow-lg backdrop-blur-sm
    ${disabled ? 'opacity-30 pointer-events-none' : 'cursor-pointer'}`;

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-3 w-56 h-56 mx-auto mt-2 flex-shrink-0 md:hidden safe-area-bottom">
      <div />
      <button
        className={btnClass}
        onTouchStart={(e) => handleTouch(e, 'UP')}
        onClick={(e) => handleTouch(e, 'UP')}
        aria-label="Move Up"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <div />
      <button
        className={btnClass}
        onTouchStart={(e) => handleTouch(e, 'LEFT')}
        onClick={(e) => handleTouch(e, 'LEFT')}
        aria-label="Move Left"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-gray-700/40 border border-gray-600/30" />
      </div>
      <button
        className={btnClass}
        onTouchStart={(e) => handleTouch(e, 'RIGHT')}
        onClick={(e) => handleTouch(e, 'RIGHT')}
        aria-label="Move Right"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div />
      <button
        className={btnClass}
        onTouchStart={(e) => handleTouch(e, 'DOWN')}
        onClick={(e) => handleTouch(e, 'DOWN')}
        aria-label="Move Down"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div />
    </div>
  );
}
