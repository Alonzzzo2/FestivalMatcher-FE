/**
 * Safely decodes HTML entities in a string using DOMParser.
 * This approach is safer than using innerHTML as it doesn't execute scripts.
 * 
 * @param text - The text containing HTML entities to decode
 * @returns The decoded text with HTML entities replaced by their actual characters
 * 
 * @example
 * decodeHtmlEntities("&quot;Hello&quot;") // returns: "Hello"
 * decodeHtmlEntities("2022&#x2F;06&#x2F;13") // returns: "2022/06/13"
 */
export const decodeHtmlEntities = (text: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc.documentElement.textContent || text;
};
