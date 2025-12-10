import { useState } from 'react';
import { FestivalMatchResponse } from '../types';

interface DateRangeSearchFormProps {
    setTopMatches: (matches: FestivalMatchResponse[]) => void;
    setDateRange?: (range: { start: string, end: string } | null) => void;
    mode: 'liked' | 'playlist';
}

export default function DateRangeSearchForm({ setTopMatches, setDateRange, mode }: DateRangeSearchFormProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isEndDateEnabled, setIsEndDateEnabled] = useState(false);
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        setStartDate(newStart);

        // Automatically set End Date to start date + 1 day
        if (newStart) {
            const startDateObj = new Date(newStart);
            const nextDay = new Date(startDateObj);
            nextDay.setDate(startDateObj.getDate() + 1);
            setEndDate(nextDay.toISOString().split('T')[0]);
            setIsEndDateEnabled(true);
        } else {
            setEndDate('');
            setIsEndDateEnabled(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                throw new Error('Start date must be before end date');
            }

            if (mode === 'playlist' && !playlistUrl.trim()) {
                throw new Error('Please enter a standard Spotify playlist URL');
            }

            const params = new URLSearchParams({
                startDate: startDate,
                endDate: endDate
            });

            if (mode === 'playlist') {
                params.append('playlistUrl', playlistUrl.trim());
            }

            const endpoint = mode === 'liked'
                ? '/festivalmatching/by-date-range'
                : '/festivalmatching/by-date-range/playlist';

            const url = `${import.meta.env.VITE_API_BASE_URL}${endpoint}?${params.toString()}`;

            const res = await fetch(url, {
                credentials: 'include',
            });

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('Authentication required. Please log in with Spotify first.');
                }
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error (${res.status})`);
            }

            const data = await res.json();

            // Check if response is empty
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No festivals found within this date range matching your music taste.');
            }

            // Map response to expected type if needed
            // The API response structure matches FestivalMatchResponse roughly, but let's verify keys
            // Guide says "festival" property, but our type expects "festivalMetadata"
            // We need to map it if the backend strictly follows the guide

            const mappedData: FestivalMatchResponse[] = data.map((item: any) => ({
                url: item.url,
                matchedArtistsCount: item.matchedArtistsCount,
                matchedTracksCount: item.matchedTracks || item.matchedTracksCount, // Handle both
                tracksPerShow: item.tracksPerShow,
                rankingMessage: item.rankingMessage,
                festivalMetadata: item.festival || item.festivalMetadata // Handle both
            }));

            setTopMatches(mappedData);
            if (setDateRange) {
                setDateRange({ start: startDate, end: endDate });
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">
                Find Festivals by Date Range
                {mode === 'liked' ? ' (Liked Songs)' : ' (Playlist)'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-gray-300 mb-2">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-gray-300 mb-2">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={`w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500 ${!isEndDateEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required
                            disabled={!isEndDateEnabled}
                        />
                    </div>
                </div>

                {mode === 'playlist' && (
                    <div>
                        <label htmlFor="playlistUrl" className="block text-gray-300 mb-2">Spotify Playlist URL</label>
                        <input
                            type="text"
                            id="playlistUrl"
                            value={playlistUrl}
                            onChange={(e) => setPlaylistUrl(e.target.value)}
                            placeholder="https://open.spotify.com/playlist/..."
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500"
                            required
                        />
                        <p className="text-gray-400 text-sm mt-1">Playlist must be public.</p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-900 text-red-200 rounded text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition duration-200"
                >
                    {loading ? 'Searching...' : '🔍 Find Festivals'}
                </button>
            </form>
        </div>
    );
}
