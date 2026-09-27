export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://xevoprop.onrender.com/api";

export async function apiFetch(path, options = {}) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestOptions = {
    ...options,
    headers,
  };

  // Convert normal JavaScript objects to JSON.
  // Keep FormData untouched for file uploads.
  if (
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(
    `${API_URL}${path}`,
    requestOptions
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message || "Request failed"
    );
  }

  return data;
}