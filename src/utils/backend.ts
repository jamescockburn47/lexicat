// Utility helpers for constructing backend URLs

/**
 * Base URL for the backend API. When VITE_BACKEND_URL is not set,
 * requests will be made relative to the current host.
 */
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

/**
 * Build a URL for the backend by optionally prefixing with BACKEND_BASE_URL.
 * @param path Path beginning with '/'
 * @returns Full URL string pointing to the backend
 */
export function backendUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  return BACKEND_BASE_URL ? `${BACKEND_BASE_URL}${path}` : path
}
