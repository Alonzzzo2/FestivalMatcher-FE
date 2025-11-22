import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './components/Login'
import FestivalForm from './components/FestivalForm'
import Result from './components/Result'
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [clashfinderLink, setClashfinderLink] = useState<string | null>(null)
  const [festivalStats, setFestivalStats] = useState<{
    totalPossibleLikedTracks: number
    rank: number
    festivalName?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkLoginStatus = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/authentication/profile`
      
      const res = await fetch(apiUrl, {
        credentials: 'include',
      })
      
      if (res.ok) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/authentication/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      // Silently fail - user will be logged out client-side anyway
    } finally {
      setIsLoggedIn(false)
      setClashfinderLink(null)
    }
  }

  // Check if user is already logged in (token in cookie)
  useEffect(() => {
    checkLoginStatus()
  }, [])

  // Recheck login status when window comes back into focus
  useEffect(() => {
    const handleFocus = () => {
      checkLoginStatus()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {!isLoggedIn ? (
              <Login setIsLoggedIn={setIsLoggedIn} />
            ) : clashfinderLink ? (
              <Result
                link={clashfinderLink}
                stats={festivalStats || undefined}
                onReset={() => {
                  setClashfinderLink(null)
                  setFestivalStats(null)
                }}
              />
            ) : (
              <FestivalForm 
                setClashfinderLink={setClashfinderLink}
                setFestivalStats={setFestivalStats}
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default App
