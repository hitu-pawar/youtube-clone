import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHistory, clearHistory, removeFromHistory } from '../../historyUtils'
import { value_converter } from '../../data'
import './History.css'

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
  };

  const handleRemove = (videoId) => {
    removeFromHistory(videoId);
    setHistory(getHistory());
  };

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <h3>No watch history yet</h3>
        <p>Videos you watch will appear here.</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h3>Watch History</h3>
        <button onClick={handleClearAll} className="clear-history-btn">
          Clear all history
        </button>
      </div>

      <div className="history-list">
        {history.map((item) => (
          <div className="history-card" key={item.videoId}>
            <Link to={`/video/0/${item.videoId}`} className="history-link">
              <img src={item.thumbnail} alt={item.title} className="history-thumbnail" />
              <div className="history-info">
                <h4>{item.title}</h4>
                <p>{item.channelTitle}</p>
                <p className="history-views">
                  {value_converter(item.viewCount)} views
                </p>
              </div>
            </Link>
            <button
              className="history-remove-btn"
              onClick={() => handleRemove(item.videoId)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default History