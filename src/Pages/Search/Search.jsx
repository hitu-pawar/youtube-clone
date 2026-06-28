import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_KEY } from '../../data'
import './Search.css'

// ISO 8601 duration (jasं PT1M30S) la seconds madhе convert kar
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

const Search = () => {
  const { searchQuery } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=${searchQuery}&type=video&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const items = data.items || [];

      if (items.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }

      // Pratyek video chi duration check karण्यासाठी contentDetails fetch kar
      const videoIds = items.map((item) => item.id.videoId).join(",");
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      const durationMap = {};
      (detailsData.items || []).forEach((item) => {
        durationMap[item.id] = parseDuration(item.contentDetails.duration);
      });

      // Shorts (60 seconds peksha kमी duration) काढून टाक
      const filtered = items.filter((item) => {
        const dur = durationMap[item.id.videoId];
        return dur === undefined || dur > 60;
      });

      setVideos(filtered);
    } catch (error) {
      console.error("Search fetch error:", error);
      setVideos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery]);

  if (loading) {
    return <div className="search-loading">Loading...</div>;
  }

  if (videos.length === 0) {
    return <div className="search-empty">No results found for "{searchQuery}"</div>;
  }

  return (
    <div className="search-page">
      <h3 className="search-heading">Search results for: {searchQuery}</h3>

      <div className="search-results-list">
        {videos.map((item) => (
          <Link
            to={`/video/0/${item.id.videoId}`}
            key={item.id.videoId}
            className="search-result-card"
          >
            <img
              src={item.snippet.thumbnails.medium.url}
              alt={item.snippet.title}
              className="search-thumbnail"
            />
            <div className="search-info">
              <h4 className="search-title">{item.snippet.title}</h4>
              <p className="search-channel">{item.snippet.channelTitle}</p>
              <p className="search-date">
                {new Date(item.snippet.publishedAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Search