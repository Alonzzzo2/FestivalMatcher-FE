// Google Analytics event tracking utility

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Festival matching events
export const trackFestivalMatch = (
  festivalName: string,
  festivalId: string,
  mode: 'liked' | 'playlist'
): void => {
  trackEvent('festival_match', {
    festival_name: festivalName,
    festival_id: festivalId,
    match_mode: mode,
  });
};

export const trackFestivalMatchResult = (
  festivalName: string,
  matchedTracks: number,
  matchedArtists: number
): void => {
  trackEvent('festival_match_result', {
    festival_name: festivalName,
    matched_tracks: matchedTracks,
    matched_artists: matchedArtists,
  });
};

// Search events
export const trackYearSearch = (
  year: number,
  mode: 'liked' | 'playlist',
  resultCount: number
): void => {
  trackEvent('year_search', {
    year,
    search_mode: mode,
    result_count: resultCount,
  });
};

export const trackDateRangeSearch = (
  startDate: string,
  endDate: string,
  mode: 'liked' | 'playlist',
  resultCount: number
): void => {
  trackEvent('date_range_search', {
    start_date: startDate,
    end_date: endDate,
    search_mode: mode,
    result_count: resultCount,
  });
};

export const trackDiscoverySearch = (
  searchType: 'year' | 'dateRange',
  mode: 'liked' | 'playlist',
  resultCount: number
): void => {
  trackEvent('discovery_search', {
    search_type: searchType,
    discovery_mode: mode,
    result_count: resultCount,
  });
};

// Sorting and filtering events
export const trackSortChange = (
  newSortOption: string,
  mode: 'liked' | 'playlist'
): void => {
  trackEvent('sort_change', {
    sort_by: newSortOption,
    mode,
  });
};

export const trackFilterChange = (
  filterType: string,
  filterValue: string,
  mode?: 'liked' | 'playlist'
): void => {
  trackEvent('filter_change', {
    filter_type: filterType,
    filter_value: filterValue,
    ...(mode ? { mode } : {}),
  });
};

// Result interaction events
export const trackLoadMore = (
  currentlyShowing: number,
  totalResults: number
): void => {
  trackEvent('load_more_results', {
    currently_showing: currentlyShowing,
    total_results: totalResults,
  });
};

export const trackClashfinderClick = (
  festivalName: string,
  festivalId: string
): void => {
  trackEvent('clashfinder_click', {
    festival_name: festivalName,
    festival_id: festivalId,
  });
};

// Authentication events
export const trackLogin = (): void => {
  trackEvent('user_login');
};

export const trackLogout = (): void => {
  trackEvent('user_logout');
};

// Error tracking
export const trackError = (
  errorMessage: string,
  context: string
): void => {
  trackEvent('app_error', {
    error_message: errorMessage,
    error_context: context,
  });
};

// Mode/feature toggling
export const trackLikedSongsToggle = (enabled: boolean): void => {
  trackEvent('liked_songs_toggle', {
    enabled,
  });
};

// Result selection
export const trackResultSelection = (
  festivalName: string,
  festivalId: string,
  mode: 'liked' | 'playlist'
): void => {
  trackEvent('result_selection', {
    festival_name: festivalName,
    festival_id: festivalId,
    mode,
  });
};
