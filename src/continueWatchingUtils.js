const CW_KEY = "continueWatching";

const getAll = () => {
  const data = localStorage.getItem(CW_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveProgress = (videoId, info) => {
  const all = getAll();
  // Video 95% peksha jasta baghला असेल तर "complete" mhanun remove kar
  const percent = info.duration > 0 ? (info.currentTime / info.duration) * 100 : 0;

  if (percent > 95) {
    delete all[videoId];
  } else if (info.currentTime > 10) {
    // Fakta 10 seconds peksha jasta baghले असेल तरच save kar
    all[videoId] = { ...info, updatedAt: new Date().toISOString() };
  }

  localStorage.setItem(CW_KEY, JSON.stringify(all));
};

export const getProgress = (videoId) => {
  const all = getAll();
  return all[videoId] || null;
};

export const getAllProgress = () => {
  const all = getAll();
  return Object.entries(all)
    .map(([videoId, data]) => ({ videoId, ...data }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const removeProgress = (videoId) => {
  const all = getAll();
  delete all[videoId];
  localStorage.setItem(CW_KEY, JSON.stringify(all));
};