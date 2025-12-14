export interface FestivalInfo {
    name: string;
    id: string;
    url: string;
    startDate: string; // ISO 8601 date string
    endDate?: string;
    printAdvisory: number;
    totalActs: number;
}

export interface FestivalMetadata {
    name: string;
    id: string;
    startDate: string;
    endDate?: string;
    printAdvisory: number;
    numDays: number;
    numStages: number;
    numActs: number;
    numPerformingArtists?: number; // Optional as it might be missing in some responses
    url?: string; // Optional as it might be at root
    playlistMetadata?: PlaylistMetadata; // Present for playlist-based results
}

export interface PlaylistMetadata {
    playlistId?: string;
    playlistName?: string;
    playlistUrl?: string;
    playlistImageUrl?: string;
    totalTracks?: number;
    owner?: string;
    description?: string;
}

export interface FestivalMatchResponse {
    url: string;
    matchedArtistsCount: number;
    matchedTracksCount: number;
    tracksPerShow: number;
    rankingMessage?: string;
    festivalMetadata: FestivalMetadata;
}
