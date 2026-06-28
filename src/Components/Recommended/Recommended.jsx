import React, { useEffect, useState } from "react";
import "./Recommended.css";
import { Link } from "react-router-dom";
import moment from "moment";
import { API_KEY, value_converter } from "../../data";

const Recommended = ({ categoryId }) => {
  const [apiData, setApiData] = useState([]);

  const fetchData = async () => {
    try {
      const relatedVideo_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=20&regionCode=US&videoCategoryId=${categoryId}&key=${API_KEY}`;

      const response = await fetch(relatedVideo_url);
      const data = await response.json();

      if (data.items) {
        setApiData(data.items);
      }
    } catch (error) {
      console.error("Error fetching recommended videos:", error);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  return (
    <div className="recommended">
      {apiData.map((item) => (
        <Link
          to={`/video/${item.snippet.categoryId}/${item.id}`}
          className="side-video-list"
          key={item.id}
        >
          <img
            src={item.snippet.thumbnails.medium.url}
            alt={item.snippet.title}
          />

          <div className="vid-info">
            <h4>{item.snippet.title}</h4>

            <p>{item.snippet.channelTitle}</p>

            <p>
              {value_converter(item.statistics.viewCount)} Views &bull;{" "}
              {moment(item.snippet.publishedAt).fromNow()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Recommended;