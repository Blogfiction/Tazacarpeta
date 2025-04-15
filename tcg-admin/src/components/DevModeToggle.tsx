import { useDev } from '../context/DevContext';

export default function DevModeToggle() {
  const { isDevMode, toggleDevMode } = useDev();

  return (
    <div className="fixed bottom-4 right-4" style={{ zIndex: 9999 }}>
      <button
        onClick={toggleDevMode}
        className={`px-4 py-2 font-press-start text-sm rounded-lg shadow-lg transition-colors ${
          isDevMode
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        } retro-button`}
      >
        {isDevMode ? 'DEV: ON' : 'DEV: OFF'}
      </button>
    </div>
  );
} 