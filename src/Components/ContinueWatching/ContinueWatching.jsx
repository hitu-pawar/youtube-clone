import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProgress, removeProgress } from '../../continueWatchingUtils'
import './ContinueWatching.css'

const ContinueWatching = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getAllProgress());
  }, []);

  const handleRemove = (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    removeProgress(videoId);
    setItems(getAllProgress());
  };

  if (items.length === 0) return null;

  return (
    <div className="continue-watching">
      <h3 className="cw-heading">▶️ Continue Watching</h3>
      <div className="cw-list">
        {items.map((item) => {
          const percent = item.duration > 0
            ? Math.min((item.currentTime / item.duration) * 100, 100)
            : 0;

          return (
            <Link
              to={`/video/0/${item.videoId}`}
              key={item.videoId}
              className="cw-card"
            >
              <div className="cw-thumb-wrapper">
                <img src={item.thumbnail} alt={item.title} />
                <div className="cw-progress-bar">
                  <div
                    className="cw-progress-fill"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <button
                  className="cw-remove-btn"
                  onClick={(e) => handleRemove(e, item.videoId)}
                >
                  ✕
                </button>
              </div>
              <h4 className="cw-title">{item.title}</h4>
              <p className="cw-channel">{item.channelTitle}</p>
            </Link>
          );
        })}
      </div>
    </div>
  )
}

export default ContinueWatching