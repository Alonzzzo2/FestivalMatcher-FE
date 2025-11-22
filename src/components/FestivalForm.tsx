import { useState } from 'react'

interface FestivalFormProps {
  setClashfinderLink: (link: string) => void
  setFestivalStats?: (stats: { totalPossibleLikedTracks: number; rank: number; festivalName?: string }) => void
}

export default function FestivalForm({ setClashfinderLink, setFestivalStats }: FestivalFormProps) {
  const [festival, setFestival] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [festivals, setFestivals] = useState<Array<{
    title: string;
    internalName: string;
    startDate: string;
    printAdvisory: number;
  }>>([]);
  const [search, setSearch] = useState('');
  const [selectedInternalName, setSelectedInternalName] = useState('');
  const [festivalsLoaded, setFestivalsLoaded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch festivals only when user interacts with the search box
  const fetchFestivals = async () => {
    if (festivalsLoaded) return;
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
          setError('Festival list response is invalid.');
        }
        setFestivalsLoaded(true);
      } else {
        setError('Failed to load festival list. Please try again later.');
      }
    } catch (err) {
      setError('Network error loading festival list.');
    }
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

    setLoading(true);

    try {
      // If you want to support cache bypass, add logic here (e.g., a checkbox or always false)
      const forceReloadData = false; // Change to true if you want to bypass cache
      const url = `${import.meta.env.VITE_API_BASE_URL}/festivalmatching/${encodeURIComponent(festivalIdentifier)}${forceReloadData ? '?forceReloadData=true' : ''}`;
      const res = await fetch(url, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch festival data');
      }

      const contentType = res.headers.get('content-type');
      let clashfinderUrl: string | null = null;

      // Handle both JSON and plain text responses
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        clashfinderUrl = data.url || data.clashfinderUrl;

        // Extract stats if available
        if (setFestivalStats && data.totalPossibleLikedTracks !== undefined) {
          setFestivalStats({
            totalPossibleLikedTracks: data.totalPossibleLikedTracks,
            rank: data.rank || 0,
            festivalName: data.festival?.name || '',
          });
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
      const message =
        err instanceof Error
          ? err.message
          : 'Error fetching festival data. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Select Your Festival</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4" style={{position: 'relative'}}>
          <label htmlFor="festival-search" className="block text-gray-300 mb-2">
            Search Festival Name
          </label>
          <input
            id="festival-search"
            type="text"
            autoComplete="off"
            value={selectedInternalName ? festival : search}
            onFocus={() => { fetchFestivals(); setShowDropdown(true); }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedInternalName('');
              setFestival('');
              setShowDropdown(true);
              if (!festivalsLoaded) fetchFestivals();
            }}
            placeholder="Type to search..."
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500 mb-2"
            disabled={loading}
          />
          {showDropdown && (
            <div className="max-h-40 overflow-y-auto mb-2 absolute z-10 bg-gray-800 border border-gray-600 rounded shadow-lg" style={{width: 'inherit', minWidth: '200px'}}>
              {error && (
                <div className="mb-2 p-2 bg-red-900 text-red-200 rounded">{error}</div>
              )}
              {!error && Array.isArray(festivals) && festivals.filter(f => f.title?.toLowerCase().includes(search.toLowerCase())).map(f => (
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
              {search && !error && Array.isArray(festivals) && festivals.filter(f => f.title?.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <div className="text-gray-400 px-2 py-1">No festivals found</div>
              )}
            </div>
          )}
          <p className="text-gray-400 text-sm mt-1">
            You can select a festival from the list or manually enter a festival name.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition duration-200"
        >
          {loading ? 'Loading...' : '🎪 Get My Clashfinder'}
        </button>
      </form>
    </div>
  )
}
