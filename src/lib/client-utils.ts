// Client-side utilities
export async function clientFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return { response, data };
}