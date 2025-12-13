import { useState } from 'react';
import { FestivalMatchResponse } from '../types';
import LoadingAnimation from './LoadingAnimation';
import { trackDateRangeSearch, trackError } from '../utils/analytics';

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

            trackDateRangeSearch(startDate, endDate, mode, mappedData.length);
            setTopMatches(mappedData);
            if (setDateRange) {
                setDateRange({ start: startDate, end: endDate });
            }

        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(message);
            trackError(message, 'date_range_search_form');
        } finally {
            setLoading(false);
        }
    };

    const handlePreset = (preset: 'month' | 'summer' | 'year') => {
        const start = new Date();
        const end = new Date();

        if (preset === 'month') {
            end.setDate(start.getDate() + 30);
        } else if (preset === 'summer') {
            // Logic for "This Summer" or "Next Summer"
            // Assume Summer is June 1st to Aug 31st
            const currentYear = start.getFullYear();
            const summerStart = new Date(currentYear, 5, 1); // June 1
            if (start > summerStart) {
                // If we're past June 1st, check if we're past august. 
                // Simple logic: if today is before Aug 31, start today or June 1, end Aug 31.
                // If today is past Aug 31, do next year.
                // Let's keep it simple: "Next 3 Months" instead of complex variable summer logic?
                // User asked for "easy to use". "Next Summer" is great for festivals.
                summerStart.setFullYear(currentYear + 1);
            }
            start.setTime(summerStart.getTime());
            end.setTime(summerStart.getTime());
            end.setMonth(7); // August
            end.setDate(31);
        } else if (preset === 'year') {
            end.setFullYear(start.getFullYear() + 1);
        }

        const startStr = start.toISOString().split('T')[0];
        setStartDate(startStr);
        setEndDate(end.toISOString().split('T')[0]);
        setIsEndDateEnabled(true);
    };

    if (loading) {
        return <LoadingAnimation />;
    }

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">
                Find Festivals by Date Range
                {mode === 'liked' ? ' (Liked Songs)' : ' (Playlist)'}
            </h2>

            {/* Quick Presets */}
            <div className="mb-6 flex flex-wrap gap-2">
                <span className="text-gray-400 text-sm py-1.5 mr-2">Quick Select:</span>
                <button
                    type="button"
                    onClick={() => handlePreset('month')}
                    className="bg-gray-700 hover:bg-gray-600 text-green-400 text-xs font-bold py-1.5 px-3 rounded-full border border-gray-600 transition-colors"
                >
                    +30 Days
                </button>
                <button
                    type="button"
                    onClick={() => handlePreset('summer')}
                    className="bg-gray-700 hover:bg-gray-600 text-yellow-400 text-xs font-bold py-1.5 px-3 rounded-full border border-gray-600 transition-colors"
                >
                    ☀️ Next Summer
                </button>
                <button
                    type="button"
                    onClick={() => handlePreset('year')}
                    className="bg-gray-700 hover:bg-gray-600 text-blue-400 text-xs font-bold py-1.5 px-3 rounded-full border border-gray-600 transition-colors"
                >
                    📅 Next Year
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                        <label htmlFor="startDate" className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wide">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            min={new Date().toISOString().split('T')[0]}
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200 [color-scheme:dark] cursor-pointer"
                            required
                        />
                    </div>
                    <div className="relative group">
                        <label htmlFor="endDate" className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wide">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={`w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200 [color-scheme:dark] ${!isEndDateEnabled ? 'opacity-50 cursor-not-allowed border-gray-800' : 'cursor-pointer'}`}
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
