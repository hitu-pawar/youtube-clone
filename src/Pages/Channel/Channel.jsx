import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_KEY, value_converter } from '../../data'
import { isSubscribed, subscribeToChannel, unsubscribeFromChannel } from '../../channelUtils'
import './Channel.css'


const Channel = () => {
  const { channelId } = useParams();
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchChannelData = async () => {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    setChannelData(data.items[0]);
  };

  const fetchChannelVideos = async () => {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=25&type=video&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    setVideos(data.items || []);
  };

  useEffect(() => {
    setLoading(true);
    fetchChannelData();
    fetchChannelVideos();
    setSubscribed(isSubscribed(channelId));
    setLoading(false);
  }, [channelId]);

  const handleSubscribe = () => {
    if (subscribed) {
      unsubscribeFromChannel(channelId);
      setSubscribed(false);
    } else {
      subscribeToChannel({
        channelId: channelId,
        channelTitle: channelData?.snippet?.title,
        channelThumbnail: channelData?.snippet?.thumbnails?.default?.url,
        subscriberCount: channelData?.statistics?.subscriberCount,
      });
      setSubscribed(true);
    }
  };

  if (loading || !channelData) {
    return <div className="channel-loading">Loading...</div>;
  }

  const bannerUrl = channelData.brandingSettings?.image?.bannerExternalUrl;
  const avatarUrl =
    channelData.snippet.thumbnails?.high?.url ||
    channelData.snippet.thumbnails?.medium?.url ||
    channelData.snippet.thumbnails?.default?.url;

  return (
    <div className="channel-page">
      {bannerUrl && (
        <img
          className="channel-banner"
          src={`${bannerUrl}=w1280`}
          alt=""
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}

      <div className="channel-header">
        <img
          className="channel-avatar"
          src={avatarUrl}
          alt=""
          onError={(e) => {
            e.target.src =
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
          }}
        />
        <div className="channel-details">
          <h2>{channelData.snippet.title}</h2>
          <p className="channel-subs">
            {value_converter(channelData.statistics.subscriberCount)} Subscribers &bull;{" "}
            {value_converter(channelData.statistics.videoCount)} Videos
          </p>
          <p className="channel-desc">
            {channelData.snippet.description?.slice(0, 150)}
          </p>
        </div>
        <button
          onClick={handleSubscribe}
          className={subscribed ? "channel-subscribed-btn" : "channel-subscribe-btn"}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>

      <hr />

      <div className="channel-videos">
        {videos.map((item) => (
          <Link
            to={`/video/0/${item.id.videoId}`}
            key={item.id.videoId}
            className="channel-video-card"
          >
            <img src={item.snippet.thumbnails.medium.url} alt="" />
            <h4>{item.snippet.title}</h4>
            <p>{new Date(item.snippet.publishedAt).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Channel