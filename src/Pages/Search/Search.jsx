import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_KEY } from '../../data'
import './Search.css'
import { SearchSkeleton } from '../../Components/Skeleton/Skeleton'
import { useToast } from '../../Components/Toast/Toast'

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { showToast } = useToast();
  const observerRef = useRef(null);
  const loaderRef = useRef(null);

  const fetchSearchResults = async (pageToken = "") => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${searchQuery}&type=video&pageToken=${pageToken}&key=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data = await response.json();
      const items = data.items || [];

      if (items.length === 0) {
        if (pageToken === "") setVideos([]);
        setHasMore(false);
        setError(false);
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

      if (pageToken === "") {
        setVideos(filtered);
      } else {
        setVideos((prev) => [...prev, ...filtered]);
      }

      setNextPageToken(data.nextPageToken || null);
      setHasMore(!!data.nextPageToken);
      setError(false);
    } catch (error) {
      console.error("Search fetch error:", error);
      setError(true);
      showToast("Search failed. Check your connection or API quota.", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setVideos([]);
    setNextPageToken(null);
    setHasMore(true);
    fetchSearchResults("");
  }, [searchQuery]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && !loading && nextPageToken) {
      setLoadingMore(true);
      fetchSearchResults(nextPageToken);
    }
  }, [hasMore, loadingMore, loading, nextPageToken]);

  useEffect(() => {
    const option = { root: null, rootMargin: "200px", threshold: 0 };
    observerRef.current = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observerRef.current.observe(loaderRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleObserver]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    fetchSearchResults("");
  };

  if (loading) {
    return <SearchSkeleton count={6} />;
  }

  if (error && videos.length === 0) {
    return (
      <div className="search-error">
        <p>⚠️ Kahi problem zali search karताना.</p>
        <button onClick={handleRetry} className="search-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return <div className="search-empty">No results found for "{searchQuery}"</div>;
  }

  return (
    <div className="search-page">
      <h3 className="search-heading">Search results for: {searchQuery}</h3>

      <div className="search-results-list">
        {videos.map((item, index) => (
          <Link
            to={`/video/0/${item.id.videoId}`}
            key={`${item.id.videoId}-${index}`}
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

      {/* Infinite scroll trigger + loading more indicator */}
      <div ref={loaderRef} style={{ textAlign: "center", padding: "20px" }}>
        {loadingMore && <p>Loading more results...</p>}
        {!hasMore && videos.length > 0 && <p style={{ color: "#909090" }}>No more results.</p>}
      </div>
    </div>
  )
}

export default Search