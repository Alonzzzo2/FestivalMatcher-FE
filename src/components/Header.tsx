interface HeaderProps {
  isLoggedIn?: boolean
  onLogout?: () => void
  onHeadlineClick?: () => void
}

export default function Header(props: HeaderProps) {
  const { isLoggedIn = false, onLogout, onHeadlineClick } = props;
  return (
    <header className="bg-gradient-to-b from-gray-800 to-gray-900 border-b border-green-500/30 py-4 md:py-8">
      <div className="container mx-auto px-4 relative">
        {isLoggedIn && onLogout && (
          <div className="absolute right-4 top-0 md:top-6">
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-red-500/50"
            >
              Logout
            </button>
          </div>
        )}
        <div className="flex flex-col items-center gap-2 md:gap-6 cursor-pointer group pt-8 md:pt-0" onClick={typeof onHeadlineClick === 'function' ? onHeadlineClick : undefined}>
          {/* Title */}
          <div className="flex items-center gap-4 md:gap-6">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-green-500 to-purple-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-purple-400 transition-all duration-300">
              Festival Matcher
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-gray-400 text-xs md:text-base max-w-xl mx-auto text-center">
            Find your perfect festival lineup based on your favorite music
          </p>
        </div>
      </div>
    </header>
  )
}
