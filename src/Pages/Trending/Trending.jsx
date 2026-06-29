import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_KEY, value_converter } from '../../data'
import { FeedSkeleton } from '../../Components/Skeleton/Skeleton'
import './Trending.css'

const Trending = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=30&regionCode=IN&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      setVideos(data.items || []);
    } catch (error) {
      console.error("Trending fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  if (loading) return <FeedSkeleton count={12} />;

  return (
    <div className="trending-page">
      <h2 className="trending-heading">🔥 Trending Now</h2>
      <div className="trending-grid">
        {videos.map((item, index) => (
          <Link to={`/video/0/${item.id}`} key={item.id} className="trending-card">
            <span className="trending-rank">#{index + 1}</span>
            <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} />
            <h4>{item.snippet.title}</h4>
            <p>{item.snippet.channelTitle}</p>
            <p>{value_converter(item.statistics.viewCount)} views</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Trending