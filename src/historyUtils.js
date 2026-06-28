const HISTORY_KEY = "watchHistory";
const MAX_HISTORY = 50;

export const addToHistory = (video) => {
  const history = getHistory();

  // Already asel tar remove kar (duplicate avoid + latest var anaycha)
  const filtered = history.filter((item) => item.videoId !== video.videoId);

  const updated = [video, ...filtered].slice(0, MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const getHistory = () => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

export const removeFromHistory = (videoId) => {
  const history = getHistory();
  const filtered = history.filter((item) => item.videoId !== videoId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
};