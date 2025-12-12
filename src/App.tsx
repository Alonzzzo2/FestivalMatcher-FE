import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './components/Login'
import FestivalForm from './components/FestivalForm'
import Result from './components/Result'
import FestivalDiscoveryForm from './components/FestivalDiscoveryForm'
import YearSearchForm from './components/YearSearchForm'
import DateRangeSearchForm from './components/DateRangeSearchForm'
import TopMatchesResult from './components/TopMatchesResult'
import { ErrorBoundary } from './components/ErrorBoundary';
import { FestivalMatchResponse } from './types';

const getTitle = (range: { start: string, end: string } | null, fallback: string) => {
  if (!range) return fallback;
  
  const yearMatch = range.start.match(/^(\d{4})-01-01$/);
  const endMatch = range.end.match(/^(\d{4})-12-31$/);
  
  if (yearMatch && endMatch && yearMatch[1] === endMatch[1]) {
      return `Top Festivals for ${yearMatch[1]}`;
  }
  
  return `Top Festivals (${new Date(range.start).toLocaleDateString()} - ${new Date(range.end).toLocaleDateString()})`;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [clashfinderLink, setClashfinderLink] = useState<string | null>(null)
  const [festivalStats, setFestivalStats] = useState<FestivalMatchResponse | null>(null)
  const [topMatches, setTopMatches] = useState<FestivalMatchResponse[] | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [dateRange, setDateRange] = useState<{ start: string, end: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [entryMode, setEntryMode] = useState<'choose' | 'login' | 'playlist' | 'discovery-liked' | 'discovery-playlist'>('choose');
  const [enableLiked, setEnableLiked] = useState(() => {
    return localStorage.getItem('enableLiked') === 'true';
  });

  const toggleLiked = () => setEnableLiked(!enableLiked);

  const [festivals, setFestivals] = useState<Array<{
    name: string;
    id: string;
    url: string;
    startDate: string;
    endDate?: string;
    printAdvisory: number;
    totalActs: number;
  }>>([])
  const [festivalsError, setFestivalsError] = useState<string | null>(null)

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

  const fetchFestivals = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clashfinders/list/all`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFestivals(data);
        } else {
          setFestivals([]);
          setFestivalsError('Festival list response is invalid.');
        }
      } else {
        setFestivalsError('Failed to load festival list. Please try again later.');
      }
    } catch (err) {
      setFestivalsError('Network error loading festival list.');
    }
  };

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
      setTopMatches(null)
      setEntryMode('choose');
    }
  }

  // Check if user is already logged in (token in cookie)
  useEffect(() => {
    checkLoginStatus()
    fetchFestivals()
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
        <Footer onHeartClick={toggleLiked} />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} onHeadlineClick={() => { setEntryMode('choose'); setTopMatches(null); setClashfinderLink(null); }} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className={topMatches ? "max-w-5xl mx-auto" : "max-w-md mx-auto"}>
            {entryMode === 'choose' ? (
              <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center justify-center gap-2">
                      <span>🎵</span> Festival Highlights
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm">Generate timeline highlights for a festival, from your music</p>
                    <div className="flex flex-col gap-3">
                      {enableLiked && (
                        <button
                          className="w-full bg-green-500 hover:bg-green-600 text-white text-base font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                          onClick={() => setEntryMode('login')}
                        >
                          {isLoggedIn ? 'Match Liked Songs to Festival' : 'Login for Liked Songs'}                          
                        </button>
                      )}
                      <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                        onClick={() => setEntryMode('playlist')}
                      >
                        Match Playlist to Festival
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 my-6 pt-6">
                    <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center justify-center gap-2">
                      <span>🗓️</span> Festivals Discovery
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm">Find festivals matching your music, by date range</p>
                    <div className="flex flex-col gap-3">
                      {enableLiked && (
                        <button
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white text-base font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                          onClick={() => setEntryMode('discovery-liked')}
                        >
                          {isLoggedIn ? 'Find Festivals by Liked Songs' : 'Login for Liked Songs'}
                        </button>
                      )}
                      <button
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-base font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                        onClick={() => setEntryMode('discovery-playlist')}
                      >
                        Find Festivals by Playlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : entryMode === 'login' ? (
              !isLoggedIn ? (
                <Login setIsLoggedIn={setIsLoggedIn} />
              ) : clashfinderLink ? (
                <Result
                  festival={festivalStats}
                  onReset={() => {
                    setClashfinderLink(null)
                    setFestivalStats(null)
                  }}
                  mode="liked"
                />
              ) : (
                <FestivalForm
                  setClashfinderLink={setClashfinderLink}
                  setFestivalStats={setFestivalStats}
                  mode={'liked'}
                  festivals={festivals}
                  festivalsError={festivalsError}
                />
              )
            ) : entryMode === 'playlist' ? (
              clashfinderLink ? (
                <Result
                  festival={festivalStats}
                  onReset={() => {
                    setClashfinderLink(null)
                    setFestivalStats(null)
                  }}
                  mode="playlist"
                />
              ) : (
                <FestivalForm
                  setClashfinderLink={setClashfinderLink}
                  setFestivalStats={setFestivalStats}
                  mode={'playlist'}
                  festivals={festivals}
                  festivalsError={festivalsError}
                />
              )
            ) : entryMode === 'discovery-liked' ? (
              !isLoggedIn ? (
                <Login setIsLoggedIn={setIsLoggedIn} />
              ) : topMatches ? (
                <TopMatchesResult
                  matches={topMatches}
                  title={getTitle(dateRange, "Top Festivals")}
                  onReset={() => { setTopMatches(null); setDateRange(null); }}
                  mode="liked"
                />
              ) : (
                <FestivalDiscoveryForm
                  setTopMatches={setTopMatches}
                  setDateRange={setDateRange}
                  mode="liked"
                  festivals={festivals}
                />
              )
            ) : entryMode === 'discovery-playlist' ? (
              topMatches ? (
                <TopMatchesResult
                  matches={topMatches}
                  title={getTitle(dateRange, "Top Festivals")}
                  onReset={() => { setTopMatches(null); setDateRange(null); }}
                  mode="playlist"
                />
              ) : (
                <FestivalDiscoveryForm
                  setTopMatches={setTopMatches}
                  setDateRange={setDateRange}
                  mode="playlist"
                  festivals={festivals}
                />
              )
            ) : entryMode === 'year-liked' ? (
              !isLoggedIn ? (
                <Login setIsLoggedIn={setIsLoggedIn} />
              ) : topMatches ? (
                <TopMatchesResult
                  matches={topMatches}
                  year={selectedYear}
                  onReset={() => setTopMatches(null)}
                  mode="liked"
                />
              ) : (
                <YearSearchForm
                  setTopMatches={(matches) => {
                    setTopMatches(matches);
                    if (matches.length > 0) {
                      setSelectedYear(new Date().getFullYear());
                    }
                  }}
                  mode="liked"
                />
              )
            ) : entryMode === 'year-playlist' ? (
              topMatches ? (
                <TopMatchesResult
                  matches={topMatches}
                  year={selectedYear}
                  onReset={() => setTopMatches(null)}
                  mode="playlist"
                />
              ) : (
                <YearSearchForm
                  setTopMatches={(matches) => {
                    setTopMatches(matches);
                    if (matches.length > 0) {
                      setSelectedYear(new Date().getFullYear());
                    }
                  }}
                  mode="playlist"
                />
              )
            ) : entryMode === 'date-range-liked' ? (
              !isLoggedIn ? (
                <Login setIsLoggedIn={setIsLoggedIn} />
              ) : topMatches ? (
                <TopMatchesResult
                  matches={topMatches}
                  title={getTitle(dateRange, "Top Festivals by Date Range")}
                  onReset={() => { setTopMatches(null); setDateRange(null); }}
                  mode="liked"
                />
              ) : (
                <DateRangeSearchForm
                  setTopMatches={setTopMatches}
                  setDateRange={setDateRange}
                  mode="liked"
                />
              )
            ) : entryMode === 'date-range-playlist' ? (
              topMatches ? (
                <TopMatchesResult
                  matches={topMatches}
                  title={getTitle(dateRange, "Top Festivals by Date Range")}
                  onReset={() => { setTopMatches(null); setDateRange(null); }}
                  mode="playlist"
                />
              ) : (
                <DateRangeSearchForm
                  setTopMatches={setTopMatches}
                  setDateRange={setDateRange}
                  mode="playlist"
                />
              )
            ) : null}
          </div>
        </main>
        <Footer onHeartClick={toggleLiked} />
      </div>
    </ErrorBoundary>
  )
}

export default App
