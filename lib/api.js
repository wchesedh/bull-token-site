const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const cache = new Map();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        await response.json().catch(() => null)
      );
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export const getCachedData = async (key, fetcher) => {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    if (cached) {
      console.warn(`Using stale cache for ${key} due to error:`, error);
      return cached.data;
    }
    throw error;
  }
};

export const fetchCryptoNews = async () => {
  const key = 'crypto-news';
  return getCachedData(key, async () => {
    const response = await fetchWithRetry('/api/get-crypto-news');
    const data = await response.json();
    return data;
  });
};

export const fetchTokenData = async () => {
  const key = 'token-data';
  return getCachedData(key, async () => {
    const response = await fetchWithRetry('/api/get-token');
    const data = await response.json();
    return data;
  });
}; 