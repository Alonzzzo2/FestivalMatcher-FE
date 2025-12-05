import { COOKIE_NAME, COOKIE_EXPIRY_DAYS, SORT_PREFERENCES, SortPreference } from '../constants';

/**
 * Get sort preference from cookie
 * @returns Sort preference value from cookie, or null if not found
 */
export function getSortPreferenceFromCookie(): SortPreference | null {
    const cookieName = `${COOKIE_NAME}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(cookieName) === 0) {
            const value = cookie.substring(cookieName.length);
            return validateSortPreference(value);
        }
    }

    return null;
}

/**
 * Set sort preference cookie
 * @param preference - Sort preference to save
 */
export function setSortPreferenceCookie(preference: SortPreference): void {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    const expires = `expires=${expiryDate.toUTCString()}`;

    // Note: HttpOnly, Secure, SameSite are set by backend when using API
    // Frontend sets basic cookie for client-side preference storage
    document.cookie = `${COOKIE_NAME}=${preference};${expires};path=/`;
}

/**
 * Validate sort preference value
 * @param value - Value to validate
 * @returns Valid sort preference or default (Ranking)
 */
export function validateSortPreference(value: string): SortPreference {
    const validValues = Object.values(SORT_PREFERENCES);
    return validValues.includes(value as SortPreference)
        ? (value as SortPreference)
        : SORT_PREFERENCES.RANKING;
}

/**
 * Get sort preference with fallback order: param > cookie > default
 * @param queryParam - Optional query parameter value
 * @returns Sort preference to use
 */
export function getSortPreference(queryParam?: string | null): SortPreference {
    if (queryParam) {
        return validateSortPreference(queryParam);
    }

    const cookieValue = getSortPreferenceFromCookie();
    if (cookieValue) {
        return cookieValue;
    }

    return SORT_PREFERENCES.RANKING;
}
