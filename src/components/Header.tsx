import { trackLogout } from '../utils/analytics';

interface HeaderProps {
  isLoggedIn?: boolean
  onLogout?: () => void
  onHeadlineClick?: () => void
}

export default function Header(props: HeaderProps) {
  const { isLoggedIn = false, onLogout, onHeadlineClick } = props;
  const showLogout = isLoggedIn && onLogout;

  return (
    <header className="bg-gradient-to-b from-gray-800 to-gray-900 border-b border-green-500/30 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className={`relative flex items-center ${showLogout ? 'justify-between md:justify-center' : 'justify-center'}`}>
          <div className={`flex flex-col cursor-pointer group ${showLogout ? 'items-start md:items-center' : 'items-center'}`} onClick={typeof onHeadlineClick === 'function' ? onHeadlineClick : undefined}>
            {/* Title */}
            <div className="flex items-center gap-4 md:gap-6">
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-green-500 to-purple-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-purple-400 transition-all duration-300">
                Festival Matcher
              </h1>
            </div>
          </div>

          {showLogout && (
            <div className="md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 pl-2 md:pl-0">
              <button
                onClick={() => {
                  trackLogout();
                  onLogout?.();
                }}
                aria-label="Logout"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3 rounded shadow-lg transition-all duration-200 hover:shadow-red-500/50 whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Subtitle */}
        <p className={`text-gray-400 text-xs md:text-base max-w-xl mt-3 md:mt-4 ${showLogout ? 'text-left md:text-center md:mx-auto' : 'text-center mx-auto'}`}>
          Find your perfect festival lineup based on your favorite music
        </p>
      </div>
    </header>
  )
}
