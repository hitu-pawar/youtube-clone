import React, { useState, useEffect } from 'react'
import { getHistory } from '../../historyUtils'
import './Stats.css'

const Stats = () => {
  const [stats, setStats] = useState({
    totalVideos: 0,
    topChannels: [],
    recentActivity: [],
  });

  useEffect(() => {
    const history = getHistory();

    const channelCount = {};
    history.forEach((item) => {
      channelCount[item.channelTitle] = (channelCount[item.channelTitle] || 0) + 1;
    });

    const topChannels = Object.entries(channelCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([channel, count]) => ({ channel, count }));

    setStats({
      totalVideos: history.length,
      topChannels,
      recentActivity: history.slice(0, 5),
    });
  }, []);

  return (
    <div className="stats-page">
      <h2>📊 My Watch Stats</h2>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>{stats.totalVideos}</h3>
          <p>Total Videos Watched</p>
        </div>
        <div className="stat-card">
          <h3>{stats.topChannels.length}</h3>
          <p>Unique Channels</p>
        </div>
      </div>

      <div className="stats-section">
        <h3>🏆 Top Watched Channels</h3>
        {stats.topChannels.length === 0 ? (
          <p className="stats-empty">Ajun kahi videos baghitle nahit.</p>
        ) : (
          stats.topChannels.map((item, index) => (
            <div className="stats-row" key={index}>
              <span className="stats-rank">#{index + 1}</span>
              <span className="stats-name">{item.channel}</span>
              <span className="stats-count">{item.count} videos</span>
            </div>
          ))
        )}
      </div>

      <div className="stats-section">
        <h3>🕒 Recent Activity</h3>
        {stats.recentActivity.length === 0 ? (
          <p className="stats-empty">Kahi recent activity nahi.</p>
        ) : (
          stats.recentActivity.map((item, index) => (
            <div className="stats-row" key={index}>
              <span className="stats-name">{item.title}</span>
              <span className="stats-count">
                {new Date(item.watchedAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Stats