import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Feed.css';
import { Link } from 'react-router-dom';
import { API_KEY, value_converter } from '../../data';
import moment from 'moment';
import { FeedSkeleton } from '../Skeleton/Skeleton';
import { useToast } from '../Toast/Toast';

const Feed = ({ category }) => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { showToast } = useToast();
  const observerRef = useRef(null);
  const loaderRef = useRef(null);

  const fetchData = async (pageToken = "") => {
    try {
      const videolist_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=20&regionCode=US&videoCategoryId=${category}&pageToken=${pageToken}&key=${API_KEY}`;

      const response = await fetch(videolist_url);

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const result = await response.json();

      if (pageToken === "") {
        setData(result.items || []);
      } else {
        setData((prev) => [...prev, ...(result.items || [])]);
      }

      setNextPageToken(result.nextPageToken || null);
      setHasMore(!!result.nextPageToken);
      setError(false);
    } catch (err) {
      console.error("Feed fetch error:", err);
      setError(true);
      showToast("Failed to load videos. Check your connection or API quota.", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Category change zalyavar fresh load kar
  useEffect(() => {
    setLoading(true);
    setData([]);
    setNextPageToken(null);
    setHasMore(true);
    fetchData("");
  }, [category]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && !loading && nextPageToken) {
      setLoadingMore(true);
      fetchData(nextPageToken);
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
    fetchData("");
  };

  // Initial loading state
  if (loading) {
    return <FeedSkeleton count={12} />;
  }

  // Error state (fakta initial load fail zali tar)
  if (error && data.length === 0) {
    return (
      <div className="feed-error">
        <p>⚠️ Kahi problem zali videos load karताना.</p>
        <button onClick={handleRetry} className="feed-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="feed">

      {data.map((item, index) => (
        <Link
          to={`/video/${item.snippet.categoryId}/${item.id}`}
          className="card"
          key={`${item.id}-${index}`}
        >
          <img
            src={item.snippet.thumbnails.medium.url}
            alt={item.snippet.title}
          />

          <h2>{item.snippet.title}</h2>

          <h3>{item.snippet.channelTitle}</h3>

          <p>
            {value_converter(item.statistics.viewCount)} &bull;{" "}
            {moment(item.snippet.publishedAt).fromNow()}
          </p>
        </Link>
      ))}

      {/* Infinite scroll trigger + loading more indicator */}
      <div ref={loaderRef} style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px" }}>
        {loadingMore && <p>Loading more videos...</p>}
        {!hasMore && data.length > 0 && <p style={{ color: "#909090" }}>No more videos to load.</p>}
      </div>

    </div>
  );
};

export default Feed;