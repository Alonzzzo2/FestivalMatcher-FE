import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "Connecting to Spotify...",
  "Fetching your top artists and tracks...",
  "Analyzing your music taste...",
  "Scanning festival lineups...",
  "Comparing artists...",
  "Finding your perfect match...",
  "Almost there..."
];

export default function LoadingAnimation() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-8 bg-gray-800 rounded-lg shadow-lg min-h-[400px]">
      {/* Musical Note Animation */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Pinging Heart Background */}
        <div className="absolute inset-0 flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-green-500 opacity-20 animate-ping" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
           </svg>
        </div>
        
        {/* Pulsing Heart Middle */}
        <div className="absolute inset-2 flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-green-500 opacity-40 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
           </svg>
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce z-10">
          🎵
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-white">Searching Festivals</h3>
        <p className="text-green-400 text-lg font-medium min-h-[2rem] transition-all duration-500">
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <p className="text-gray-500 text-sm mt-4">
          This might take a few seconds depending on the festival size
        </p>
      </div>
    </div>
  );
}
