const RECENT_KEY = "recentSearches";
const MAX_RECENT = 8;

export const getRecentSearches = () => {
  const data = localStorage.getItem(RECENT_KEY);
  return data ? JSON.parse(data) : [];
};

export const addRecentSearch = (query) => {
  if (!query || query.trim() === "") return;
  const trimmed = query.trim();
  let recent = getRecentSearches();
  recent = recent.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  recent.unshift(trimmed);
  recent = recent.slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
};

export const removeRecentSearch = (query) => {
  let recent = getRecentSearches();
  recent = recent.filter((item) => item !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
};

export const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_KEY);
};