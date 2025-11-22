import { useState, useEffect } from 'react'

interface LoginProps {
  setIsLoggedIn?: (value: boolean) => void
}

export default function Login({ setIsLoggedIn: _ }: LoginProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cookieWarning, setCookieWarning] = useState(false)

  // Detect if user is back at Spotify connect screen after already connecting
  // This should be triggered by parent (App) when profile endpoint indicates not logged in
  // For simplicity, check if window.location.pathname or hash matches Spotify connect
  useEffect(() => {
    // Example: If redirected to /connect or similar after login attempt
    const isSpotifyConnectScreen = window.location.pathname.includes('connect') || window.location.hash.includes('connect');
    if (isSpotifyConnectScreen) {
      setCookieWarning(true);
    }
  }, []);
  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/authentication/login`,
        {
          credentials: 'include',
        }
      )
      
      const contentType = res.headers.get('content-type')
      let loginUrl: string | null = null

      // Handle both JSON and plain text responses
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json()
        loginUrl = data.loginUrl
      } else {
        // If response is plain text, treat it as the URL directly
        loginUrl = await res.text()
      }

      if (loginUrl && loginUrl.startsWith('http')) {
        window.location.href = loginUrl
      } else {
        setError('Failed to retrieve login URL')
      }
    } catch (err) {
      setError('Error initiating login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Welcome!</h2>
      <p className="text-gray-300 mb-6">
        Connect your Spotify account to get started
      </p>

      {cookieWarning && (
        <div className="mb-4 p-3 bg-yellow-900 text-yellow-200 rounded">
          <strong>Cookies must be enabled</strong> for login to work. If you are seeing the Spotify connect screen again after already connecting, please enable cookies in your browser settings.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition duration-200"
      >
        {loading ? 'Connecting...' : '🎵 Login with Spotify'}
      </button>
    </div>
  )
}
