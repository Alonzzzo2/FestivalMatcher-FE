import { useState } from 'react'
import { FestivalMatchResponse } from '../types';

interface FestivalFormProps {
  setClashfinderLink: (link: string) => void
  setFestivalStats?: (stats: FestivalMatchResponse) => void
  mode?: 'liked' | 'playlist';
  festivals?: Array<{
    title: string;
    internalName: string;
    startDate: string;
    printAdvisory: number;
  }>;
  festivalsError?: string | null;
}

export default function FestivalForm({ setClashfinderLink, setFestivalStats, mode = 'liked', festivals = [], festivalsError = null }: FestivalFormProps) {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [festival, setFestival] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedInternalName, setSelectedInternalName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Use error from props if available
  const displayError = error || festivalsError;
  // Validation helper to check if form is valid
  const isFormValid = () => {
    const festivalIdentifier = selectedInternalName || search.trim();
    if (!festivalIdentifier) {
      return false;
    }
    if (mode === 'playlist' && !playlistUrl.trim()) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Use selectedInternalName if chosen, otherwise use the search value
    const festivalIdentifier = selectedInternalName || search.trim();
    if (!festivalIdentifier) {
      setError('Please select or enter a festival name');
      return;
    }

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

      // Handle both JSON and plain text responses
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();

        // Check if it's the new response format (has matchedTracksCount and rankingMessage)
        if (data.matchedTracksCount !== undefined && data.rankingMessage !== undefined) {
          const response = data as FestivalMatchResponse;
          clashfinderUrl = response.url;
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
    } finally {
      setLoading(false);
    }
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
              onChange={e => setPlaylistUrl(e.target.value)}
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
            type="text"
            autoComplete="off"
            value={selectedInternalName ? festival : search}
            onFocus={() => { setShowDropdown(true); }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedInternalName('');
              setFestival('');
              setShowDropdown(true);
            }}
            placeholder="Type to search..."
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500 mb-2"
            disabled={loading}
          />
          {showDropdown && (
            <div className="max-h-40 overflow-y-auto mb-2 absolute z-10 bg-gray-800 border border-gray-600 rounded shadow-lg" style={{ width: 'inherit', minWidth: '200px' }}>
              {displayError && (
                <div className="mb-2 p-2 bg-red-900 text-red-200 rounded">{displayError}</div>
              )}
              {!displayError && Array.isArray(festivals) && festivals.filter(f => f.title?.toLowerCase().includes(search.toLowerCase())).map(f => (
                <div
                  key={f.internalName}
                  className={`cursor-pointer px-2 py-1 rounded border ${selectedInternalName === f.internalName ? 'bg-green-700 text-white border-green-400' : 'bg-gray-700 text-gray-200 border-transparent'} mb-1 hover:bg-green-600`}
                  onMouseDown={() => {
                    setSelectedInternalName(f.internalName);
                    setFestival(f.title);
                    setShowDropdown(false);
                  }}
                >
                  <span className="font-bold">{f.title}</span>
                  <span className="ml-2 text-xs text-gray-400">({f.internalName})</span>
                  {selectedInternalName === f.internalName && (
                    <span className="ml-2 text-green-300 font-bold">✓</span>
                  )}
                </div>
              ))}
              {search && !displayError && Array.isArray(festivals) && festivals.filter(f => f.title?.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <div className="text-gray-400 px-2 py-1">No festivals found</div>
              )}
            </div>
          )}
          <p className="text-gray-400 text-sm mt-1">
            You can select a festival from the list or manually enter a festival name.
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
