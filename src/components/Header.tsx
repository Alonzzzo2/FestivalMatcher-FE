interface HeaderProps {
  isLoggedIn?: boolean
  onLogout?: () => void
  onHeadlineClick?: () => void
}

const FestivalMatcherLogo = () => (
  <svg width="100" height="100" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark circle background */}
    <circle cx="100" cy="100" r="95" fill="url(#darkGradient)" />

    {/* Gradients */}
    <defs>
      <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1a4d2e" />
        <stop offset="100%" stopColor="#0f1419" />
      </linearGradient>
      <linearGradient id="greenPurple" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6fdc8c" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
    </defs>

    {/* Spotify icon (left) */}
    <circle cx="50" cy="100" r="12" fill="#6fdc8c" />
    <path d="M46 96 Q50 94 54 96 M46 99 Q50 97 54 99 M46 102 Q50 100 54 102" stroke="#1a4d2e" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Chain link icon (right) */}
    <rect x="138" y="92" width="24" height="16" rx="4" fill="#a78bfa" />
    <rect x="146" y="96" width="8" height="8" fill="#1a4d2e" />
    <rect x="154" y="96" width="8" height="8" fill="#1a4d2e" />

    {/* Central heart with music notes */}
    <circle cx="100" cy="105" r="35" stroke="url(#greenPurple)" strokeWidth="4" fill="none" />

    {/* Heart shape */}
    <path d="M100 120 C90 110, 75 110, 75 95 C75 85, 85 80, 100 90 C115 80, 125 85, 125 95 C125 110, 110 110, 100 120 Z" fill="url(#greenPurple)" opacity="0.3" />

    {/* Music notes */}
    <circle cx="90" cy="105" r="5" fill="#6fdc8c" />
    <rect x="95" y="85" width="3" height="20" fill="#6fdc8c" />
    <circle cx="110" cy="105" r="5" fill="#a78bfa" />
    <rect x="115" y="85" width="3" height="20" fill="#a78bfa" />

    {/* Arrows */}
    <path d="M75 70 Q60 85 75 100" stroke="#6fdc8c" strokeWidth="3" fill="none" markerEnd="url(#arrowGreen)" />
    <path d="M125 100 Q140 85 125 70" stroke="#a78bfa" strokeWidth="3" fill="none" markerEnd="url(#arrowPurple)" />

    <defs>
      <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
        <polygon points="0,0 10,5 0,10" fill="#6fdc8c" />
      </marker>
      <marker id="arrowPurple" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
        <polygon points="0,0 10,5 0,10" fill="#a78bfa" />
      </marker>
    </defs>

    {/* Crowd silhouettes at bottom */}
    <g opacity="0.6">
      <ellipse cx="60" cy="170" rx="8" ry="15" fill="#4a5568" />
      <ellipse cx="75" cy="168" rx="7" ry="18" fill="#4a5568" />
      <ellipse cx="90" cy="170" rx="9" ry="16" fill="#4a5568" />
      <ellipse cx="100" cy="165" rx="8" ry="20" fill="#4a5568" />
      <ellipse cx="110" cy="170" rx="9" ry="16" fill="#4a5568" />
      <ellipse cx="125" cy="168" rx="7" ry="18" fill="#4a5568" />
      <ellipse cx="140" cy="170" rx="8" ry="15" fill="#4a5568" />
    </g>
  </svg>
);

export default function Header(props: HeaderProps) {
  const { isLoggedIn = false, onLogout, onHeadlineClick } = props;
  return (
    <header className="bg-gradient-to-b from-gray-800 to-gray-900 border-b border-green-500/30 py-8">
      <div className="container mx-auto px-4">
        {isLoggedIn && onLogout && (
          <div className="flex justify-end mb-4 md:absolute md:right-4 md:top-6 md:mb-0">
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-red-500/50"
            >
              Logout
            </button>
          </div>
        )}
        <div className="flex flex-col items-center gap-6 cursor-pointer group" onClick={typeof onHeadlineClick === 'function' ? onHeadlineClick : undefined}>
          {/* Title with Flanking Logos */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Left Logo - SVG */}
            <div className="w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <FestivalMatcherLogo />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-green-500 to-purple-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-purple-400 transition-all duration-300">
              Festival Matcher
            </h1>

            {/* Right Logo - SVG */}
            <div className="w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <FestivalMatcherLogo />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto text-center">
            Find your perfect festival lineup based on your Spotify taste
          </p>
        </div>
      </div>
    </header>
  )
}
