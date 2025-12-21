/**
 * API utility functions untuk Redux slices
 * Centralized API helper dengan error handling
 */

import { getApiUrl } from "@/lib/api";

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

/**
 * Build headers dengan authorization token
 */
function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Handle API response dengan error handling
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      message: data.error || data.message || "An error occurred",
      status: response.status,
      data: data,
    };
    throw error;
  }

  return data.data || data;
}

/**
 * Generic GET request
 */
export async function apiGet<T>(
  endpoint: string,
  options: { includeAuth?: boolean } = {}
): Promise<T> {
  const { includeAuth = true } = options;

  const response = await fetch(getApiUrl(endpoint), {
    method: "GET",
    headers: getHeaders(includeAuth),
  });

  return handleResponse<T>(response);
}

/**
 * Generic POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options: { includeAuth?: boolean } = {}
): Promise<T> {
  const { includeAuth = true } = options;

  const response = await fetch(getApiUrl(endpoint), {
    method: "POST",
    headers: getHeaders(includeAuth),
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * Generic PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options: { includeAuth?: boolean } = {}
): Promise<T> {
  const { includeAuth = true } = options;

  const response = await fetch(getApiUrl(endpoint), {
    method: "PUT",
    headers: getHeaders(includeAuth),
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * Generic PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options: { includeAuth?: boolean } = {}
): Promise<T> {
  const { includeAuth = true } = options;

  const response = await fetch(getApiUrl(endpoint), {
    method: "PATCH",
    headers: getHeaders(includeAuth),
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * Generic DELETE request
 */
export async function apiDelete<T>(
  endpoint: string,
  options: { includeAuth?: boolean } = {}
): Promise<T> {
  const { includeAuth = true } = options;

  const response = await fetch(getApiUrl(endpoint), {
    method: "DELETE",
    headers: getHeaders(includeAuth),
  });

  return handleResponse<T>(response);
}

/**
 * Generic POST request with FormData (for file uploads)
 */
export async function apiPostFormData<T>(
  endpoint: string,
  formData: FormData,
  options: { includeAuth?: boolean } = {}
): Promise<T> {
  const { includeAuth = true } = options;

  const headers: HeadersInit = {};
  if (includeAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  // Don't set Content-Type header - browser will set it with boundary for FormData

  const response = await fetch(getApiUrl(endpoint), {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse<T>(response);
}

/**
 * Generic PUT request with FormData (for file uploads)
 */
export async function apiPutFormData<T>(
  endpoint: string,
  formData: FormData,
  options: { includeAuth?: boolean } = {}
): Promise<T> {
  const { includeAuth = true } = options;

  const headers: HeadersInit = {};
  if (includeAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  // Don't set Content-Type header - browser will set it with boundary for FormData

  const response = await fetch(getApiUrl(endpoint), {
    method: "PUT",
    headers,
    body: formData,
  });

  return handleResponse<T>(response);
}

/**
 * Handle 401 error - redirect to login
 */
export function handleUnauthorized() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}
