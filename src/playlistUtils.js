const PLAYLISTS_KEY = "yt_playlists";

export const getPlaylists = () => {
  const data = localStorage.getItem(PLAYLISTS_KEY);
  if (!data) {
    // Default "Saved Videos" playlist
    const defaults = {
      saved: { id: "saved", name: "Saved Videos", videos: [] }
    };
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

const savePlaylists = (playlists) => {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
};

export const createPlaylist = (name) => {
  const playlists = getPlaylists();
  const id = "pl_" + Date.now().toString();
  playlists[id] = {
    id,
    name,
    videos: [],
    createdAt: new Date().toISOString(),
  };
  savePlaylists(playlists);
  return playlists; // updated object return kar
};

export const addVideoToPlaylist = (playlistId, video) => {
  const playlists = getPlaylists();
  if (!playlists[playlistId]) return;
  const alreadyExists = playlists[playlistId].videos.some((v) => v.videoId === video.videoId);
  if (!alreadyExists) {
    playlists[playlistId].videos.push({ ...video, addedAt: new Date().toISOString() });
  }
  savePlaylists(playlists);
};

export const removeVideoFromPlaylist = (playlistId, videoId) => {
  const playlists = getPlaylists();
  if (!playlists[playlistId]) return;
  playlists[playlistId].videos = playlists[playlistId].videos.filter((v) => v.videoId !== videoId);
  savePlaylists(playlists);
};

export const deletePlaylist = (playlistId) => {
  const playlists = getPlaylists();
  delete playlists[playlistId];
  savePlaylists(playlists);
  return playlists;
};

export const getPlaylistById = (playlistId) => {
  const playlists = getPlaylists();
  return playlists[playlistId] || null;
};