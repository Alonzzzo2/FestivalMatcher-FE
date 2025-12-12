import { useState } from 'react';
import { FestivalMatchResponse } from '../types';
import LoadingAnimation from './LoadingAnimation';

interface FestivalDiscoveryFormProps {
    setTopMatches: (matches: FestivalMatchResponse[]) => void;
    setDateRange?: (range: { start: string, end: string } | null) => void;
    mode: 'liked' | 'playlist';
    festivals?: Array<{
        name: string;
        id: string;
        url: string;
        startDate: string;
        endDate?: string;
        printAdvisory: number;
        totalActs: number;
    }>;
}

type SearchMode = 'year' | 'dateRange';

export default function FestivalDiscoveryForm({ setTopMatches, setDateRange, mode, festivals = [] }: FestivalDiscoveryFormProps) {
    const [searchMode, setSearchMode] = useState<SearchMode>('year');
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isEndDateEnabled, setIsEndDateEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract unique years from festivals list and sort them
    const yearOptions = Array.from(
        new Set(
            festivals.map(festival => new Date(festival.startDate).getFullYear())
        )
    ).sort((a, b) => a - b);

    // If no festivals available, fall back to default year range
    const availableYears = yearOptions.length > 0 ? yearOptions : Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - 3 + i
    );

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        setStartDate(newStart);

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

    const handlePreset = (preset: 'month' | 'summer' | 'year') => {
        const start = new Date();
        const end = new Date();

        if (preset === 'month') {
            end.setDate(start.getDate() + 30);
        } else if (preset === 'summer') {
            const currentYearVal = start.getFullYear();
            const summerStart = new Date(currentYearVal, 5, 1);
            if (start > summerStart) {
                summerStart.setFullYear(currentYearVal + 1);
            }
            start.setTime(summerStart.getTime());
            end.setTime(summerStart.getTime());
            end.setMonth(7);
            end.setDate(31);
        } else if (preset === 'year') {
            end.setFullYear(start.getFullYear() + 1);
        }

        const startStr = start.toISOString().split('T')[0];
        setStartDate(startStr);
        setEndDate(end.toISOString().split('T')[0]);
        setIsEndDateEnabled(true);
    };

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

            if (searchMode === 'year') {
                if (mode === 'liked') {
                    url = `${import.meta.env.VITE_API_BASE_URL}/festivalmatching/by-year/${selectedYear}`;
                    fetchOptions = { credentials: 'include' };
                } else {
                    const params = new URLSearchParams({ playlistUrl: playlistUrl.trim() });
                    url = `${import.meta.env.VITE_API_BASE_URL}/festivalmatching/by-year/${selectedYear}/playlist?${params}`;
                    fetchOptions = { credentials: 'include' };
                }
            } else {
                const start = new Date(startDate);
                const end = new Date(endDate);

                if (start > end) {
                    throw new Error('Start date must be before end date');
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

                url = `${import.meta.env.VITE_API_BASE_URL}${endpoint}?${params.toString()}`;
                fetchOptions = { credentials: 'include' };
            }

            const res = await fetch(url, fetchOptions);

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('Authentication required. Please log in with Spotify first.');
                }
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error (${res.status})`);
            }

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No festivals found matching your music taste.');
            }

            const mappedData: FestivalMatchResponse[] = data.map((item: any) => ({
                url: item.url,
                matchedArtistsCount: item.matchedArtistsCount,
                matchedTracksCount: item.matchedTracks || item.matchedTracksCount,
                tracksPerShow: item.tracksPerShow,
                rankingMessage: item.rankingMessage,
                festivalMetadata: item.festival || item.festivalMetadata
            }));

            if (setDateRange) {
                if (searchMode === 'dateRange') {
                    setDateRange({ start: startDate, end: endDate });
                } else if (searchMode === 'year') {
                    setDateRange({
                        start: `${selectedYear}-01-01`,
                        end: `${selectedYear}-12-31`
                    });
                }
            }

            setTopMatches(mappedData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error fetching festival matches. Please try again.';
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
            <h2 className="text-2xl font-bold mb-6 text-white">Find Your Best Festivals</h2>

            {/* Search Mode Toggle */}
            <div className="flex gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setSearchMode('year')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 ${
                        searchMode === 'year'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    📅 By Year
                </button>
                <button
                    type="button"
                    onClick={() => setSearchMode('dateRange')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 ${
                        searchMode === 'dateRange'
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    🗓️ By Date Range
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Year Search Section */}
                {searchMode === 'year' && (
                    <div>
                        <div className="flex flex-wrap gap-2">
                            {availableYears.map(year => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => setSelectedYear(year)}
                                    className={`text-xs font-bold py-1.5 px-3 rounded-full border transition-colors ${
                                        selectedYear === year
                                            ? 'bg-purple-500 text-white border-purple-500'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                                    }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm mt-3">
                            Find the best festival matches for your selected year
                        </p>
                    </div>
                )}

                {/* Date Range Search Section */}
                {searchMode === 'dateRange' && (
                    <>
                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-700">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <label htmlFor="startDate" className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wide">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    className="w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 [color-scheme:dark] cursor-pointer"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wide">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-900 text-white border-2 border-gray-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200 [color-scheme:dark] ${!isEndDateEnabled ? 'opacity-50 cursor-not-allowed border-gray-800' : 'cursor-pointer'}`}
                                    required
                                    disabled={!isEndDateEnabled}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Playlist URL (for playlist mode) */}
                {mode === 'playlist' && (
                    <div>
                        <label htmlFor="playlistUrl" className="block text-gray-300 mb-2 font-semibold">
                            Spotify Playlist URL
                        </label>
                        <input
                            type="text"
                            id="playlistUrl"
                            value={playlistUrl}
                            onChange={(e) => setPlaylistUrl(e.target.value)}
                            placeholder="Paste a public Spotify playlist link..."
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                        <p className="text-gray-400 text-sm mt-1">Playlist must be public.</p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-900 text-red-200 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                    {loading ? 'Searching...' : '🔍 Find Festivals'}
                </button>
            </form>
        </div>
    );
}
