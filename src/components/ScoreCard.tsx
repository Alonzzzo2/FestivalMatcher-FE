import React from 'react';
import { FestivalMatchResponse } from '../types';
import { trackClashfinderClick } from '../utils/analytics';

interface ScoreCardProps {
    festival: FestivalMatchResponse;
    onVisitClashFinder?: () => void;
    mode: 'liked' | 'playlist';
}

const ScoreCard: React.FC<ScoreCardProps> = ({
    festival,
    onVisitClashFinder,
    mode
}) => {
    const formatDate = (isoDateString: string): string => {
        // Handle invalid or missing dates
        if (!isoDateString) {
            return 'Date TBA';
        }
        try {
            const date = new Date(isoDateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Date TBA';
            }
            // Use browser's locale for formatting
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Date TBA';
        }
    };

    // Generate ranking message locally
    const sourceText = mode === 'playlist' ? 'playlist' : 'liked songs';
    const rankingMessage = `${festival.matchedTracksCount} potential tracks across ${festival.matchedArtistsCount} artists from your ${sourceText}, ${festival.tracksPerShow.toFixed(2)} per show.`;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-gray-900">
            {/* Festival Header */}
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">{festival.festivalMetadata.name}</h2>
                    {festival.festivalMetadata.url && (
                        <a
                            href={festival.festivalMetadata.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-green-500 transition-colors"
                            title="Official Website"
                            onClick={(e) => e.stopPropagation()}
                        >
                            🌐
                        </a>
                    )}
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                    <span>📅 {formatDate(festival.festivalMetadata.startDate)}
                        {festival.festivalMetadata.endDate && ` - ${formatDate(festival.festivalMetadata.endDate)}`}</span>
                    {new Date(festival.festivalMetadata.startDate) < new Date() ? (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">Past Event</span>
                    ) : (
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">Upcoming</span>
                    )}
                </p>
            </div>

            {/* Match Statistics */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-lg p-6 mb-4 border border-gray-600">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-300 mb-1">Matched Tracks</p>
                        <p className="text-4xl font-bold text-green-400">{festival.matchedTracksCount}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-300 mb-1">Matched Artists</p>
                        <div className="flex flex-col items-center">
                            <p className="text-4xl font-bold text-green-400">{festival.matchedArtistsCount}</p>
                            {(festival.festivalMetadata.numPerformingArtists ?? festival.festivalMetadata.numActs) > 0 && (
                                <p className="text-xs text-gray-400 mt-1">out of {festival.festivalMetadata.numPerformingArtists ?? festival.festivalMetadata.numActs}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-center border-t border-gray-600 pt-3">
                    <p className="text-sm font-semibold text-gray-300 mb-1">Tracks Per Show</p>
                    <p className="text-2xl font-bold text-green-400">{festival.tracksPerShow.toFixed(2)}</p>
                </div>
            </div>

            {/* Ranking Message */}
            <div className="bg-gray-700 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-sm text-gray-200 font-medium">✨ {rankingMessage}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        trackClashfinderClick(festival.festivalMetadata.name, festival.festivalMetadata.id);
                        onVisitClashFinder?.();
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-center font-semibold"
                >
                    🎪 View ClashFinder Schedule
                </button>
            </div>
        </div>
    );
};

export default ScoreCard;
