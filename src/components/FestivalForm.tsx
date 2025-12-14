import { useState, useMemo, useEffect, useRef } from 'react'
import { FestivalMatchResponse } from '../types';
import LoadingAnimation from './LoadingAnimation';
import { trackFestivalMatch, trackFestivalMatchResult, trackError } from '../utils/analytics';

interface FestivalFormProps {
  setClashfinderLink: (link: string) => void
  setFestivalStats?: (stats: FestivalMatchResponse) => void
  mode?: 'liked' | 'playlist';
  festivals?: Array<{
    name: string;
    id: string;
    url: string;
    startDate: string;
    endDate?: string;
    printAdvisory: number;
    totalActs: number;
  }>;
  festivalsError?: string | null;
}

// Simple fuzzy match function: checks if all characters of query appear in target in order
const fuzzyMatch = (query: string, target: string): boolean => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (!q) return true;

  let qIdx = 0;
  let tIdx = 0;

  while (qIdx < q.length && tIdx < t.length) {
    if (q[qIdx] === t[tIdx]) {
      qIdx++;
    }
    tIdx++;
  }

  return qIdx === q.length;
};

// Highlights the matching characters in the name (optional visual enhancement, keeping it simple for now)
// Actually, let's keep it robust and simple.

export default function FestivalForm({ setClashfinderLink, setFestivalStats, mode = 'liked', festivals = [], festivalsError = null }: FestivalFormProps) {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [festival, setFestival] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Keyboard navigation state
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use error from props if available
  const displayError = error || festivalsError;

  // Filter festivals based on fuzzy search
  const filteredFestivals = useMemo(() => {
    if (!festivals) return [];
    if (!search && !selectedId) return festivals; // Show all if no search

    // If an item is selected, we might want to show all or just the selected one.
    // Standard behavior: if user types, filter.
    if (selectedId && festival === search) return festivals;

    return festivals.filter(f => fuzzyMatch(search, f.name));
  }, [festivals, search, selectedId, festival]);

  // Reset active index when search changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [search]);

  // Validation helper to check if form is valid
  const isFormValid = () => {
    // Require a valid selection from the dropdown
    if (!selectedId) {
      return false;
    }
    if (mode === 'playlist' && !playlistUrl.trim()) {
      return false;
    }
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setShowDropdown(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredFestivals.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 10, filteredFestivals.length - 1));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 10, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredFestivals.length) {
        const selected = filteredFestivals[activeIndex];
        selectFestival(selected);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const selectFestival = (f: { id: string; name: string }) => {
    setSelectedId(f.id);
    setFestival(f.name);
    setSearch(f.name);
    setShowDropdown(false);
    setActiveIndex(-1);
    setError(null);
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const activeItem = dropdownRef.current.children[activeIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Use selectedId - strictly require it
    if (!selectedId) {
      setError('Please select a festival from the list');
      return;
    }

    const festivalIdentifier = selectedId;

    if (mode === 'playlist' && !playlistUrl.trim()) {
      setError('Please enter a valid public Spotify playlist URL');
      return;
    }

    setLoading(true);

    try {
      let url = '';
      let fetchOptions: RequestInit = {};
      if (mode === 'liked') {
        url = `${import.meta.env.VITE_API_BASE_URL}/festivalmatching/${encodeURIComponent(festivalIdentifier)}`;
        fetchOptions = { credentials: 'include' };
      } else {
        const params = new URLSearchParams({ playlistUrl: playlistUrl.trim() });
        url = `${import.meta.env.VITE_API_BASE_URL}/festivalmatching/${encodeURIComponent(festivalIdentifier)}/playlist?${params}`;
        fetchOptions = {};
      }
      const res = await fetch(url, fetchOptions);

      if (!res.ok) {
        // Try to get error details from response body
        let errorMessage = 'Failed to fetch festival data';
        try {
          const errorData = await res.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch {
          // If we can't parse JSON, use status-based messages
          if (res.status === 404) {
            errorMessage = `Festival "${festivalIdentifier}" not found. Please check the festival name and try again.`;
          } else if (res.status === 400) {
            errorMessage = 'Invalid request. Please check your input and try again.';
          } else if (res.status === 401 || res.status === 403) {
            errorMessage = 'Authentication required. Please log in with Spotify.';
          } else if (res.status >= 500) {
            errorMessage = `Server error (${res.status}). Please try again later.`;
          } else {
            errorMessage = `Failed to fetch festival data (HTTP ${res.status})`;
          }
        }
        throw new Error(errorMessage);
      }

      const contentType = res.headers.get('content-type');
      let clashfinderUrl: string | null = null;
      let latestStats: FestivalMatchResponse | null = null;

      // Handle both JSON and plain text responses
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();

        // Check if it's the new response format (has matchedTracksCount)
        if (data.matchedTracksCount !== undefined) {
          const response = data as FestivalMatchResponse;
          clashfinderUrl = response.url;
          latestStats = response;
          if (setFestivalStats) {
            setFestivalStats(response);
          }
        } else {
          // Legacy fallback
          clashfinderUrl = data.url || data.clashfinderUrl;
          if (setFestivalStats && data.totalPossibleLikedTracks !== undefined) {
            // Map legacy to new format if possible, or just ignore stats for now as we want the new UI
            console.warn('Received legacy response format');
          }
        }
      } else {
        // If response is plain text, treat it as the URL directly
        clashfinderUrl = await res.text();
      }

      if (clashfinderUrl && clashfinderUrl.startsWith('http')) {
        // Track festival match
        const selectedFestival = festivals.find(f => f.id === festivalIdentifier);
        if (selectedFestival) {
          trackFestivalMatch(selectedFestival.name, festivalIdentifier, mode || 'liked');
        }
        
        // Track result
        if (latestStats) {
          const selectedFestivalName = selectedFestival?.name || festivalIdentifier;
          trackFestivalMatchResult(
            selectedFestivalName,
            latestStats.matchedTracksCount,
            latestStats.matchedArtistsCount
          );
        }
        
        setClashfinderLink(clashfinderUrl);
      } else {
        setError('No valid Clashfinder URL returned');
      }
    } catch (err) {
      let message = 'Error fetching festival data. Please try again.';

      if (err instanceof Error) {
        message = err.message;

        // Log error details for debugging
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          // Network error
          message = 'Network error. Please check your internet connection and try again.';
          console.warn('Network error during festival fetch:', err);
        } else {
          // Log other errors for debugging
          console.warn('Festival fetch error:', err.message);
        }
      }

      setError(message);
      trackError(message, 'festival_form_submission');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Get Your Festival Clashfinder Link</h2>

      <form onSubmit={handleSubmit}>
        {mode === 'playlist' && (
          <div className="mb-4">
            <label htmlFor="playlist-url" className="block text-gray-300 mb-2">Spotify Playlist URL</label>
            <input
              id="playlist-url"
              type="text"
              value={playlistUrl}
              onChange={e => {
                setPlaylistUrl(e.target.value);
                setError(null);
              }}
              placeholder="Paste a public Spotify playlist link..."
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500 mb-2"
              disabled={loading}
            />
            <p className="text-gray-400 text-sm mt-1">No login required. Playlist must be public.</p>
          </div>
        )}
        <div className="mb-4" style={{ position: 'relative' }}>
          <label htmlFor="festival-search" className="block text-gray-300 mb-2">
            Search Festival Name
          </label>
          <input
            id="festival-search"
            ref={inputRef}
            type="text"
            autoComplete="off"
            value={selectedId && festival === search ? festival : search}
            onFocus={() => { setShowDropdown(true); }}
            onBlur={() => setTimeout(() => {
              // Delay hiding to allow click events on items
              if (document.activeElement !== inputRef.current) {
                setShowDropdown(false);
              }
              // If blurring and exact match isn't selected, revert or clear? 
              // Usually we just let the user fix it or select.
              // Logic from original:
              /*
              if (!selectedId) {
                setSearch('');
              } else {
                setSearch(festival);
              }
              */
              // We'll keep this simple: if nothing selected, search stays as is (or clears).
              // But let's respect that we want to ensure valid input.
              if (!selectedId) {
                // optionally clear search if invalid
              }
            }, 200)}
            onChange={(e) => {
              setSearch(e.target.value);
              setError(null);
              // When typing, we are no longer "selected" unless we happen to type the exact name,
              // but usually we reset selection state
              if (selectedId) {
                setSelectedId('');
                setFestival('');
              }
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type to search..."
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500 mb-2"
            disabled={loading}
          />
          {(search || selectedId) && !loading && (
            <button
              type="button"
              className="absolute right-3 top-10 text-gray-400 hover:text-white"
              onClick={() => {
                setSearch('');
                setSelectedId('');
                setFestival('');
                inputRef.current?.focus();
              }}
            >
              ✕
            </button>
          )}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="max-h-60 overflow-y-auto mb-2 absolute z-10 bg-gray-800 border border-gray-600 rounded shadow-lg"
              style={{ width: '100%' }}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
            >
              {displayError && (
                <div className="mb-2 p-2 bg-red-900 text-red-200 rounded">{displayError}</div>
              )}
              {!displayError && filteredFestivals.slice(0, 100).map((f, index) => (
                <div
                  key={f.id}
                  className={`cursor-pointer px-4 py-2 border-b border-gray-700 last:border-0 ${index === activeIndex ? 'bg-green-600 text-white' :
                    selectedId === f.id ? 'bg-green-800 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                  onClick={() => selectFestival(f)}
                >
                  <div className="flex justify-between items-start w-full gap-2">
                    <span className="font-bold flex-1">{f.name}</span>
                    <div className={`flex flex-col items-end text-xs ${index === activeIndex || selectedId === f.id ? 'text-green-100' : 'text-gray-400'}`}>
                      <span>
                        {new Date(f.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {f.endDate && (
                        <span>
                          {new Date(f.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {f.totalActs > 0 && (
                        <span className="opacity-75">{f.totalActs} acts</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!displayError && filteredFestivals.length > 100 && (
                <div className="text-gray-400 px-4 py-2 text-sm italic border-t border-gray-700">
                  ...and {filteredFestivals.length - 100} more. Keep typing to refine search.
                </div>
              )}
              {search && !displayError && filteredFestivals.length === 0 && (
                <div className="text-gray-400 px-4 py-2">No festivals found matching "{search}"</div>
              )}
            </div>
          )}
          <p className="text-gray-400 text-sm mt-1">
            Type to fuzzy search (e.g. "c r f" for "Cambridge Rock Festival")
          </p>
        </div>

        {displayError && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
            {displayError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition duration-200"
        >
          {loading ? 'Loading...' : '🎪 Get My Clashfinder'}
        </button>
      </form>
    </div>
  )
}
