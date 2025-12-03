import { useState } from 'react';
import { FestivalMatchResponse } from '../types';
import ScoreCard from './ScoreCard';

interface TopMatchesResultProps {
    matches: FestivalMatchResponse[];
    onReset: () => void;
    year: number;
}

type SortOption = 'rank' | 'tracks' | 'artists';

export default function TopMatchesResult({ matches, onReset, year }: TopMatchesResultProps) {
    const [sortBy, setSortBy] = useState<SortOption>('rank');

    // Create a copy of matches with original rank preserved
    const matchesWithRank = matches.map((match, index) => ({
        ...match,
        originalRank: index + 1
    }));

    // Sort the matches based on the selected option
    const sortedMatches = [...matchesWithRank].sort((a, b) => {
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
    });

    // Display only top 10
    const topTen = sortedMatches.slice(0, 10);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                    Top Festivals for {year}
                </h2>
                <p className="text-gray-400">
                    Showing top {topTen.length} matches based on your music taste
                </p>
            </div>

            {/* Sorting Controls */}
            <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                <label htmlFor="sort-select" className="block text-gray-300 mb-2 font-semibold">
                    Sort by:
                </label>
                <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-green-500"
                >
                    <option value="rank">🏆 Rank (Default)</option>
                    <option value="tracks">🎵 Number of Liked Songs</option>
                    <option value="artists">👥 Number of Liked Artists</option>
                </select>
            </div>

            <div className="space-y-6 mb-6">
                {topTen.map((festival, index) => (
                    <div key={festival.festival.id} className="relative">
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
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onReset}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition duration-200"
            >
                ← Try Another Year
            </button>
        </div>
    );
}
