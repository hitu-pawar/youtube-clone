import React, { useEffect, useState } from "react";
import "./Recommended.css";
import { API_KEY, value_converter } from "../../data";
import { Link } from "react-router-dom";

const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

const Recommended = ({ channelId, currentVideoId }) => {
  const [videos, setVideos] = useState([]);

  const fetchChannelVideos = async () => {
    if (!channelId) return;

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=30&type=video&key=${API_KEY}`;
    const res = await fetch(searchUrl);
    const data = await res.json();

    const videoItems = data.items || [];
    const filtered = videoItems.filter(
      (item) => item.id.videoId !== currentVideoId
    );

    if (filtered.length === 0) {
      setVideos([]);
      return;
    }

    const videoIds = filtered.map((item) => item.id.videoId).join(",");
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${API_KEY}`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    const detailsMap = {};
    (statsData.items || []).forEach((item) => {
      detailsMap[item.id] = {
        statistics: item.statistics,
        duration: parseDuration(item.contentDetails.duration),
      };
    });

    // Shorts (60 seconds peksha kami duration) काढून टाक
    const merged = filtered
      .filter((item) => {
        const details = detailsMap[item.id.videoId];
        return details && details.duration > 60;
      })
      .map((item) => ({
        ...item,
        statistics: detailsMap[item.id.videoId]?.statistics || { viewCount: 0 },
      }));

    setVideos(merged);
  };

  useEffect(() => {
    fetchChannelVideos();
  }, [channelId]);

  return (
    <div className="recommended">
      {videos.map((item, index) => (
        <Link
          to={`/video/0/${item.id.videoId}`}
          key={index}
          className="side-video-list"
        >
          <img src={item.snippet.thumbnails.medium.url} alt="" />
          <div className="vid-info">
            <h4>{item.snippet.title}</h4>
            <p>{item.snippet.channelTitle}</p>
            <p>{value_converter(item.statistics.viewCount)} Views</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Recommended;