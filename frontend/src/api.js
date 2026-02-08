export async function apiFetch(url, options = {}) {
  const token = sessionStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.clear();
    window.location.href = "/";
    return;
  }

  return response;
}
