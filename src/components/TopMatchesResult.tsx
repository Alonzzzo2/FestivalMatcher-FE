import { useState, useMemo, useEffect } from 'react';
import { FestivalMatchResponse } from '../types';
import ScoreCard from './ScoreCard';

interface TopMatchesResultProps {
    matches: FestivalMatchResponse[];
    onReset: () => void;
    year?: number;
    title?: string;
    mode: 'liked' | 'playlist';
}

type SortOption = 'rank' | 'tracks' | 'artists';
type FilterOption = 'all' | 'upcoming' | 'past';

// Constants
const SORT_PREFERENCE_KEY_PREFIX = 'festivalMatcher_sortPreference_';
const VALID_SORT_OPTIONS: SortOption[] = ['rank', 'tracks', 'artists'];

// Helper function to get localStorage key based on mode
const getSortPreferenceKey = (mode: 'liked' | 'playlist') => {
    return `${SORT_PREFERENCE_KEY_PREFIX}${mode}`;
};

// Helper function to load sort preference from localStorage
const loadSortPreference = (mode: 'liked' | 'playlist'): SortOption => {
    try {
        const key = getSortPreferenceKey(mode);
        const saved = localStorage.getItem(key);
        if (saved && VALID_SORT_OPTIONS.includes(saved as SortOption)) {
            return saved as SortOption;
        }
    } catch (error) {
        // If localStorage is not available or fails, return default
        console.warn('Failed to load sort preference from localStorage:', error);
    }
    return 'rank';
};

// Helper function to save sort preference to localStorage
const saveSortPreference = (mode: 'liked' | 'playlist', sortBy: SortOption) => {
    try {
        const key = getSortPreferenceKey(mode);
        localStorage.setItem(key, sortBy);
    } catch (error) {
        // If localStorage is not available or fails, silently fail
        console.warn('Failed to save sort preference to localStorage:', error);
    }
};

export default function TopMatchesResult({ matches, onReset, year, title, mode }: TopMatchesResultProps) {
    // Initialize sortBy from localStorage based on mode
    const [sortBy, setSortBy] = useState<SortOption>(() => loadSortPreference(mode));

    // Save sort preference to localStorage whenever it changes
    useEffect(() => {
        saveSortPreference(mode, sortBy);
    }, [mode, sortBy]);

    // Pagination state
    const ITEMS_PER_PAGE = 25;
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    // Reset pagination when matches or sort order changes
    useEffect(() => {
        setDisplayCount(ITEMS_PER_PAGE);
    }, [matches, sortBy]);

    const [filterMode, setFilterMode] = useState<FilterOption>('all');

    // Filter out festivals with all zero scores AND apply date filter, then create a copy with original rank preserved
    const matchesWithRank = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return matches
            .filter(match => {
                // Score filter
                const hasScores = match.matchedArtistsCount > 0 ||
                    match.matchedTracksCount > 0 ||
                    match.tracksPerShow > 0;

                if (!hasScores) return false;

                // Date filter
                const festivalDate = new Date(match.festivalMetadata.startDate);
                if (filterMode === 'upcoming') {
                    return festivalDate >= today;
                }
                if (filterMode === 'past') {
                    return festivalDate < today;
                }
                return true;
            })
            .map((match, index) => ({
                ...match,
                originalRank: index + 1
            }));
    }, [matches, filterMode]);

    // Sort the matches based on the selected option
    const sortedMatches = useMemo(() =>
        [...matchesWithRank].sort((a, b) => {
            switch (sortBy) {
                case 'rank':
                    return a.originalRank - b.originalRank;
                case 'tracks':
                    return b.matchedTracksCount - a.matchedTracksCount;
                case 'artists':
                    return b.matchedArtistsCount - a.matchedArtistsCount;
                default:
                    return 0;
            }
        }),
        [matchesWithRank, sortBy]
    );

    const displayedMatches = useMemo(() => {
        return sortedMatches.slice(0, displayCount);
    }, [sortedMatches, displayCount]);

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    };

    // Calculate counts for each filter category
    const counts = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let all = 0;
        let upcoming = 0;
        let past = 0;

        matches.forEach(match => {
            // Check if match has scores (since we filter these out generally)
            const hasScores = match.matchedArtistsCount > 0 ||
                match.matchedTracksCount > 0 ||
                match.tracksPerShow > 0;

            if (hasScores) {
                all++;
                const festivalDate = new Date(match.festivalMetadata.startDate);
                if (festivalDate >= today) {
                    upcoming++;
                } else {
                    past++;
                }
            }
        });

        return { all, upcoming, past };
    }, [matches]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {title || `Top Festivals for ${year}`}
                </h2>
                <p className="text-gray-400">
                    Showing {sortedMatches.length} {sortedMatches.length === 1 ? 'match' : 'matches'} based on your favorite music
                </p>
            </div>

            {/* Controls Section */}
            <div className="mb-6 bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row gap-4">
                {/* Sort Control */}
                <div className="flex-1">
                    <label htmlFor="sort-select" className="block text-gray-300 mb-2 font-semibold">
                        Sort by:
                    </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500"
                    >
                        <option value="rank">🏆 Average Matched Tracks Per Show</option>
                        <option value="tracks">🎵 Number of Matched Tracks</option>
                        <option value="artists">👥 Number of Matched Artists</option>
                    </select>
                </div>

                {/* Filter Control */}
                <div className="flex-1">
                    <label className="block text-gray-300 mb-2 font-semibold">
                        Show:
                    </label>
                    <div className="flex bg-gray-700 rounded p-1 border border-gray-600">
                        <button
                            onClick={() => setFilterMode('all')}
                            className={`flex-1 py-1 px-3 rounded text-sm font-medium transition-colors ${filterMode === 'all'
                                ? 'bg-gray-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            All ({counts.all})
                        </button>
                        <button
                            onClick={() => setFilterMode('upcoming')}
                            className={`flex-1 py-1 px-3 rounded text-sm font-medium transition-colors ${filterMode === 'upcoming'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Upcoming ({counts.upcoming})
                        </button>
                        <button
                            onClick={() => setFilterMode('past')}
                            className={`flex-1 py-1 px-3 rounded text-sm font-medium transition-colors ${filterMode === 'past'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Past ({counts.past})
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6 mb-6">
                {displayedMatches.map((festival, index) => (
                    <div key={festival.festivalMetadata.id} className="relative">
                        {/* Rank Badge - Shows current sort position */}
                        <div className="absolute -left-4 top-4 z-10">
                            <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                                #{index + 1}
                            </div>
                        </div>

                        {/* Festival Card with left margin for rank badge */}
                        <div className="ml-6">
                            <ScoreCard
                                festival={festival}
                                onVisitClashFinder={() => window.open(festival.url, '_blank')}
                                mode={mode}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {displayCount < sortedMatches.length && (
                <div className="mb-8 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-200 transform hover:scale-105"
                    >
                        Load More Festivals ({sortedMatches.length - displayCount} remaining)
                    </button>
                    <p className="text-gray-400 text-sm mt-2">
                        Showing {displayedMatches.length} of {sortedMatches.length} matches
                    </p>
                </div>
            )}

            <button
                onClick={onReset}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition duration-200"
            >
                ← Try Another Search
            </button>
        </div>
    );
}
