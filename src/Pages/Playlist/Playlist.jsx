import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPlaylists, removeVideoFromPlaylist } from '../../playlistUtils'
import { value_converter } from '../../data'
import './Playlist.css'

const Playlist = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    const all = getPlaylists();
    setPlaylist(all[playlistId] || null);
  }, [playlistId]);

  const handleRemove = (videoId) => {
    removeVideoFromPlaylist(playlistId, videoId);
    const all = getPlaylists();
    setPlaylist(all[playlistId] || null);
  };

  if (!playlist) {
    return <div className="playlist-empty-page">Playlist sapडली nahi.</div>;
  }

  return (
    <div className="playlist-view-page">
      <h2>{playlist.name}</h2>
      <p className="playlist-view-count">{playlist.videos.length} videos</p>

      {playlist.videos.length === 0 ? (
        <p className="playlist-empty-page">Ya playlist madhe ajun kahi videos nahit.</p>
      ) : (
        <div className="playlist-view-list">
          {playlist.videos.map((video) => (
            <div className="playlist-view-card" key={video.videoId}>
              <Link to={`/video/0/${video.videoId}`} className="playlist-view-link">
                <img src={video.thumbnail} alt={video.title} />
                <div>
                  <h4>{video.title}</h4>
                  <p>{video.channelTitle}</p>
                </div>
              </Link>
              <button onClick={() => handleRemove(video.videoId)} className="playlist-remove-btn">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Playlist