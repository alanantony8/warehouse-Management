import { apiUrl } from "./config";

export const callApi = async (url, method, body) => {
  const response = await fetch(apiUrl + url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
};

