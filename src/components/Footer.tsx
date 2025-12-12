import { useState, useRef } from 'react';

interface FooterProps {
  onHeartClick?: () => void;
}

export default function Footer({ onHeartClick }: FooterProps) {
  const [, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  return (
    <footer className="bg-gray-800 border-t border-gray-700 py-4 mt-4">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
        <p>
          Made with <span
            onClick={() => {
              if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
              }
              setClickCount(prev => {
                const newCount = prev + 1;
                if (newCount === 5) {
                  onHeartClick?.();
                  return 0;
                }
                clickTimeoutRef.current = setTimeout(() => setClickCount(0), 1000);
                return newCount;
              });
            }}
            className="cursor-pointer"
          >❤️</span> for festival lovers using{' '}
          <a href="https://clashfinder.com" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
            Clashfinder
          </a>
        </p>

        <a
          href="https://www.buymeacoffee.com/festivalmatcher"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#F40009] px-4 py-2 rounded-lg font-bold transition-transform hover:scale-105 shadow-lg"
        >
          <img 
            src="/coke.png" 
            alt="Coke" 
            className="w-5 h-5 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '🥤 Buy me a Coke';
            }}
          />
          Buy me a Coke
        </a>
      </div>
    </footer>
  )
}
