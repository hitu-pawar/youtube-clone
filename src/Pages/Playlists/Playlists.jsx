import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlaylists, createPlaylist, deletePlaylist } from '../../playlistUtils'
import './Playlists.css'

const Playlists = () => {
  const [playlists, setPlaylists] = useState({});
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setPlaylists(getPlaylists());
  }, []);

  const handleCreate = () => {
    if (newName.trim() === "") return;
    const updated = createPlaylist(newName.trim());
    setPlaylists({ ...updated });
    setNewName("");
    setShowForm(false);
  };

  const handleDelete = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (id === "saved") return; // default playlist delete nahi karaycha
    const updated = deletePlaylist(id);
    setPlaylists({ ...updated });
  };

  return (
    <div className="playlists-page">
      <div className="playlists-header">
        <h2>📂 My Playlists</h2>
        <button onClick={() => setShowForm((prev) => !prev)} className="playlist-new-btn">
          + New Playlist
        </button>
      </div>

      {showForm && (
        <div className="playlist-form">
          <input
            type="text"
            placeholder="Playlist name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button onClick={handleCreate}>Create</button>
        </div>
      )}

      <div className="playlist-grid">
        {Object.entries(playlists).map(([id, playlist]) => (
          <Link to={`/playlist/${id}`} key={id} className="playlist-card">
            <div className="playlist-thumb-stack">
              {playlist.videos.length > 0 ? (
                <img src={playlist.videos[0].thumbnail} alt="" />
              ) : (
                <div className="playlist-empty-thumb">📁</div>
              )}
              <span className="playlist-count">{playlist.videos.length} videos</span>
            </div>
            <div className="playlist-info-row">
              <h4>{playlist.name}</h4>
              {id !== "saved" && (
                <button className="playlist-delete-btn" onClick={(e) => handleDelete(id, e)}>
                  ✕
                </button>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Playlists