# Festival Matcher Analytics Documentation

## Overview

Google Analytics is integrated into Festival Matcher to track user behavior, feature usage, and search patterns. This helps understand how users interact with the application and identify areas for improvement.

**Tracking ID:** `G-L302CLNXMQ`

## Implementation Details

### Google Analytics Setup
- **Script Location:** `index.html` (in `<head>` tag)
- **Automatic Tracking:** Page views are tracked whenever users navigate between screens
- **Event Tracking:** Custom events capture specific user actions
- **Browser History:** Back button properly navigates within the app and triggers page view events

### Page View Tracking

Each screen/mode in the application is tracked as a page view:

| Entry Mode | Page Title |
|-----------|-----------|
| `choose` | Home |
| `login` | Match Liked Songs to Festival |
| `playlist` | Match Playlist to Festival |
| `discovery-liked` | Find Festivals by Liked Songs |
| `discovery-playlist` | Find Festivals by Playlist |
| `year-liked` | Top Festivals by Year (Liked Songs) |
| `year-playlist` | Top Festivals by Year (Playlist) |
| `date-range-liked` | Top Festivals by Date Range (Liked Songs) |
| `date-range-playlist` | Top Festivals by Date Range (Playlist) |

## Events Tracked

### Search & Matching Operations

#### `festival_match`
- **Triggered:** When user selects a festival and initiates a match
- **Parameters:**
  - `festival_name` - Name of the selected festival
  - `festival_id` - Unique identifier of the festival
  - `match_mode` - Either "liked" or "playlist"
- **Use Case:** Understand which festivals are most popular among users

#### `festival_match_result`
- **Triggered:** When match results are displayed
- **Parameters:**
  - `festival_name` - Name of the matched festival
  - `matched_tracks` - Number of user tracks found at the festival
  - `matched_artists` - Number of user artists found at the festival
- **Use Case:** Analyze match quality and success metrics

#### `year_search`
- **Triggered:** When user searches for festivals by year
- **Parameters:**
  - `year` - The year searched (e.g., 2025)
  - `search_mode` - Either "liked" or "playlist"
  - `result_count` - Number of festivals found
- **Use Case:** Understand which years are most popular, adoption of year-based search

#### `date_range_search`
- **Triggered:** When user searches for festivals by date range
- **Parameters:**
  - `start_date` - Start date (YYYY-MM-DD format)
  - `end_date` - End date (YYYY-MM-DD format)
  - `search_mode` - Either "liked" or "playlist"
  - `result_count` - Number of festivals found
- **Use Case:** Analyze search patterns, seasonality of festival searches

#### `discovery_search`
- **Triggered:** When user performs a discovery search (year or date range)
- **Parameters:**
  - `search_type` - Either "year" or "dateRange"
  - `discovery_mode` - Either "liked" or "playlist"
  - `result_count` - Number of festivals found
- **Use Case:** Track engagement with festival discovery feature

### User Interactions

#### `sort_change`
- **Triggered:** When user changes sort order on results page
- **Parameters:**
  - `sort_by` - Sort option: "rank", "tracks", or "artists"
  - `mode` - Either "liked" or "playlist"
- **Use Case:** Understand user preferences for result sorting, UI improvements

#### `filter_change`
- **Triggered:** When user filters results by date (buttons in results header)
- **Parameters:**
  - `filter_type` - Type of filter (currently: "date_filter")
  - `filter_value` - Filter value: "all", "upcoming", or "past"
  - `mode` - Optional: "liked" or "playlist" for segmentation
- **Emission Points:** `TopMatchesResult` — emitted on clicks for All, Upcoming, Past with current mode
- **Use Case:** Understand preference for upcoming vs past festivals and segment by mode

#### `load_more_results`
- **Triggered:** When user clicks "Load More" to see additional results
- **Parameters:**
  - `currently_showing` - Number of results now displayed
  - `total_results` - Total available results
- **Use Case:** Measure pagination engagement, optimal page size

#### `clashfinder_click`
- **Triggered:** When user clicks the ClashFinder schedule button
- **Parameters:**
  - `festival_name` - Name of the festival
  - `festival_id` - ID of the festival
- **Use Case:** Measure conversion from match to ClashFinder visit

### Authentication Events

#### `user_login`
- **Triggered:** When user successfully logs in via Spotify
- **Parameters:** None
- **Use Case:** Track authentication conversions, user growth

#### `user_logout`
- **Triggered:** When user clicks logout button
- **Parameters:** None
- **Use Case:** Session analysis, user retention

#### `liked_songs_toggle`
- **Triggered:** When user enables or disables the "Liked Songs" feature
- **Parameters:**
  - `enabled` - Boolean: true if enabled, false if disabled
- **Use Case:** Feature adoption, user preferences

### Error Tracking

#### `app_error`
- **Triggered:** When an error occurs in the application
- **Parameters:**
  - `error_message` - Description of the error
  - `error_context` - Where the error occurred (e.g., "festival_form_submission", "year_search_form")
- **Use Case:** Identify bugs, track error frequency, improve error handling

**Error Contexts:**
- `festival_form_submission` - Error in festival matching form
- `year_search_form` - Error in year search
- `date_range_search_form` - Error in date range search
- `festival_discovery_form` - Error in festival discovery

## Accessing Analytics Data

### In Google Analytics Dashboard

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your "Festival Matcher" property
3. Navigate to relevant sections:

#### **Reports → Realtime**
- See live user activity
- Real-time page views and events

#### **Reports → Pages and Screens**
- View which pages are most popular
- See bounce rates and session duration per page
- Analyze user flow between screens

#### **Reports → Events**
- View all custom events
- See event counts and parameters
- Filter by event type, user, date

#### **Reports → User Journey**
- Understand navigation patterns
- See which screens users visit in sequence
- Identify drop-off points

#### **Reporting → Conversions** (if configured)
- Set up goals for specific events (e.g., successful festival match)
- Track conversion funnels

### Common Queries

**"Which festivals are most popular?"**
- Go to Events → `festival_match` → Filter by `festival_name`

**"How many users are using Liked Songs vs Playlist?"**
- Go to Events → Filter by `search_mode` parameter

**"What's the average number of matches per search?"**
- Go to Events → `year_search` / `date_range_search` → View `result_count` parameter

**"Where are users dropping off?"**
- Go to Reports → Pages and Screens → Look for high bounce rates

**"How often do users click ClashFinder?"**
- Go to Events → `clashfinder_click` → Count occurrences

## Technical Implementation

### Files Modified

- `index.html` - Added Google Analytics script
- `src/App.tsx` - Page view tracking, login/logout events
- `src/utils/analytics.ts` - Central analytics utility functions
- `src/components/FestivalForm.tsx` - Festival match events
- `src/components/TopMatchesResult.tsx` - Sort/filter/load more events
- `src/components/YearSearchForm.tsx` - Year search events
- `src/components/DateRangeSearchForm.tsx` - Date range search events
- `src/components/FestivalDiscoveryForm.tsx` - Discovery search events
- `src/components/Header.tsx` - Logout event
- `src/components/ScoreCard.tsx` - ClashFinder click event

### Analytics Utility Module

**Location:** `src/utils/analytics.ts`

This module provides helper functions for tracking events throughout the application. All event tracking goes through this module to ensure consistency and maintainability.

**Key Functions:**
- `trackEvent(eventName, params)` - Generic event tracker
- `trackFestivalMatch()` - Festival selection
- `trackYearSearch()` - Year-based search
- `trackDateRangeSearch()` - Date range search
- `trackError()` - Error reporting
- `trackLogin()` / `trackLogout()` - Auth events
- And more specific tracking functions

## Future Enhancements

### Potential Events to Track

1. **Playlist Input**
   - Track when users paste a playlist URL
   - Measure playlist feature adoption

2. **Search Quality Metrics**
   - Track failed searches (0 results)
   - Time spent searching
   - Refine vs new search

3. **UI Interactions**
   - Button clicks
   - Form submissions
   - Time to completion

4. **Performance Metrics**
   - Page load times
   - API response times
   - Search completion time

5. **User Segmentation**
   - Track Spotify user metadata (if applicable)
   - Device type trends
   - Geographic distribution

### Goals & Conversions to Set Up

1. **Festival Match Completion** - User gets successful match results
2. **ClashFinder Visit** - User clicks through to ClashFinder
3. **Playlist Feature Adoption** - User uses playlist matching
4. **Discovery Feature Usage** - User uses festival discovery

## Privacy & Compliance

- Analytics data is aggregated and anonymized
- No personal information is tracked
- Users can opt-out via Google Analytics settings
- Complies with GDPR and privacy regulations

## Support & Maintenance

### Troubleshooting

**Events not appearing in GA?**
1. Check that Google tag script is in `index.html` `<head>`
2. Verify tracking ID is correct: `G-L302CLNXMQ`
3. Check browser console for JavaScript errors
4. Ensure `window.gtag` is available
5. Wait 24-48 hours for data to appear in reports

**Need to add new event?**
1. Add tracking function to `src/utils/analytics.ts`
2. Call the function where the event should trigger
3. Test in development tools (GA4 Debug View)
4. Document in this file

## Contact & Questions

For analytics setup changes or improvements, refer to the implementation in `src/utils/analytics.ts` and this documentation.
