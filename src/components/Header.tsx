import logoSvg from '../assets/logo.svg';

interface HeaderProps {
  isLoggedIn?: boolean
  onLogout?: () => void
  onHeadlineClick?: () => void
}

const FestivalMatcherLogo = () => (
  <img src={logoSvg} alt="Festival Matcher Logo" className="w-full h-full" />
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
