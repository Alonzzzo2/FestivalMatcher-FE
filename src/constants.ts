// Sort preference constants
export const SORT_PREFERENCES = {
    RANKING: 'Ranking',
    MATCHED_ARTISTS: 'MatchedArtists',
    MATCHED_TRACKS: 'MatchedTracks',
} as const;

export type SortPreference = typeof SORT_PREFERENCES[keyof typeof SORT_PREFERENCES];

// Sort option labels for UI display
export const SORT_LABELS: Record<SortPreference, string> = {
    [SORT_PREFERENCES.RANKING]: 'By Ranking',
    [SORT_PREFERENCES.MATCHED_ARTISTS]: 'By Artist Count',
    [SORT_PREFERENCES.MATCHED_TRACKS]: 'By Tracks',
};

// Cookie configuration
export const COOKIE_NAME = 'SortPreference';
export const COOKIE_EXPIRY_DAYS = 365;
