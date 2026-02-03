import API_BASE_URL from '../config/api';

/**
 * Standardizes URL resolution for assets (images, PDFs, avatars)
 * Handles:
 * 1. Full URLs (Cloudinary, external)
 * 2. Base64 data strings
 * 3. Local relative paths (e.g. /uploads/...)
 * 
 * @param {string} path - The path or URL to resolve
 * @returns {string|null} - The standardized URL or null
 */
export const resolveUrl = (path) => {
    if (!path) return null;

    // 1. Return already full URLs or base64 data as-is
    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }

    // 2. Clean up the path (standardize slashes and remove leading slash)
    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

    // 3. Return path with API_BASE_URL prepended
    return `${API_BASE_URL}/${normalizedPath}`;
};

export default resolveUrl;
