import { useState } from 'react';
import { FestivalMatchResponse } from '../types';
import LoadingAnimation from './LoadingAnimation';

interface YearSearchFormProps {
    setTopMatches: (matches: FestivalMatchResponse[]) => void;
    mode: 'liked' | 'playlist';
    onPlaylistUrlChange?: (url: string) => void;
}

export default function YearSearchForm({ setTopMatches, mode, onPlaylistUrlChange }: YearSearchFormProps) {
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate year options: currentYear-3 to currentYear+1
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === 'playlist' && !playlistUrl.trim()) {
            setError('Please enter a valid public Spotify playlist URL');
            return;
        }

        setLoading(true);

        try {
            let url = '';
            let fetchOptions: RequestInit = {};

            if (mode === 'liked') {
                url = `${import.meta.env.VITE_API_BASE_URL}/festivalmatching/by-year/${selectedYear}`;
                fetchOptions = { credentials: 'include' };
            } else {
                const params = new URLSearchParams({ playlistUrl: playlistUrl.trim() });
                url = `${import.meta.env.VITE_API_BASE_URL}/festivalmatching/by-year/${selectedYear}/playlist?${params}`;
                fetchOptions = { credentials: 'include' };
                // Notify parent about the playlist URL
                onPlaylistUrlChange?.(playlistUrl.trim());
            }

            const res = await fetch(url, fetchOptions);

            if (!res.ok) {
                throw new Error('Failed to fetch festival matches');
            }

            const data = await res.json();

            // API returns array of FestivalMatchResponse
            if (Array.isArray(data)) {
                setTopMatches(data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Error fetching festival matches. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingAnimation />;
    }

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Find Best Festivals by Year</h2>

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

                <div className="mb-4">
                    <label htmlFor="year-select" className="block text-gray-300 mb-2">Select Year</label>
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500"
                        disabled={loading}
                    >
                        {yearOptions.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    <p className="text-gray-400 text-sm mt-1">
                        Find the best festival matches for this year
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
                    {loading ? 'Searching...' : '🔍 Find Best Festivals'}
                </button>
            </form>
        </div>
    );
}
