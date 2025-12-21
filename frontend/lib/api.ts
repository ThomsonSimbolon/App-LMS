export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5040";

  // Remove trailing slash
  const baseUrl = envUrl.replace(/\/$/, "");

  // If it already ends with /api, return as is
  if (baseUrl.endsWith("/api")) {
    return baseUrl;
  }

  // Otherwise, append /api
  return `${baseUrl}/api`;
}

/**
 * Build a full API URL from an endpoint path
 * @param endpoint - API endpoint path (e.g., '/activity-logs' or 'activity-logs')
 * @returns Full API URL
 *
 * Example:
 * - getApiUrl('activity-logs') -> 'http://localhost:5040/api/activity-logs'
 * - getApiUrl('/activity-logs') -> 'http://localhost:5040/api/activity-logs'
 * - Works even if NEXT_PUBLIC_API_URL is 'http://localhost:5040/api'
 */
/**
 * Get full URL for uploaded files (images, etc.)
 * Converts relative paths like /uploads/... to full backend URL
 */
export function getFileUrl(filePath: string | null | undefined): string {
  if (!filePath) return "";

  // If already a full URL (http:// or https://), return as is
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  // If relative path, prepend backend URL
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5040";
  const baseUrl = envUrl.replace(/\/api\/?$/, ""); // Remove /api if present

  // Ensure filePath starts with /
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;

  return `${baseUrl}${path}`;
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();

  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  // Ensure baseUrl doesn't have trailing slash and endpoint doesn't have leading slash
  return `${baseUrl}/${cleanEndpoint}`;
}
