import React, { useEffect, useState } from 'react';
import './PlayVideo.css';

import video1 from '../../assets/video.mp4';
import like from '../../assets/like.png';
import dislike from '../../assets/dislike.png';
import share from '../../assets/share.png';
import save from '../../assets/save.png';
import jack from '../../assets/jack.png';
import user_profile from '../../assets/user_profile.jpg';
import { API_KEY, value_converter } from '../../data';
import moment from 'moment'

const PlayVideo = ({videoId}) => {
    
  const [apiData,setApiData] = useState(null);
  const [channelData,setChannelData] = useState(null);
  const [commentData, setCommentData] = useState([]);


  const fetchVideoData = async () =>{
    const videoDetails_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
    await fetch(videoDetails_url).then(res=>res.json()).then(data =>setApiData(data.items[0]));
  };

  const fetchOtherData = async () => {
  if (!apiData) return;

  const channelData_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;

  const res = await fetch(channelData_url);
  const data = await res.json();

  setChannelData(data.items[0]);
};

const fetchCommentData = async () => {
  const comment_url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&key=${API_KEY}`;

  const res = await fetch(comment_url);
  const data = await res.json();

  if (data.items) {
    setCommentData(data.items);
  } else {
    setCommentData([]);
    console.log(data);
  }
};

useEffect(() => {
  if (videoId) {
    fetchVideoData();
  }
}, [videoId]);

   useEffect(()=>{
     fetchOtherData();

  },[apiData])

  useEffect(() => {
  if (videoId) {
    fetchCommentData();
  }
}, [videoId]);

  return (
    <div className="play-video">

      <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

      <h3>{apiData?apiData.snippet.title:"Title Here"}</h3>

      <div className="play-video-info">
        <p>
  {apiData?.statistics?.viewCount
    ? value_converter(apiData.statistics.viewCount)
    : "16K"}{" "}
  Views &bull;{" "}
  {apiData?.snippet?.publishedAt
    ? moment(apiData.snippet.publishedAt).fromNow()
    : "2 days ago"}
</p>

        <div>
          <span>
            <img src={like} alt="" /> {apiData?value_converter(apiData.statistics.likeCount):155}
          </span>

          <span>
            <img src={dislike} alt="" />
          </span>

          <span>
            <img src={share} alt="" /> Share
          </span>

          <span>
            <img src={save} alt="" /> Save
          </span>
        </div>
      </div>

      <hr />

      <div className="publisher">
        <img
  src={channelData?.snippet?.thumbnails?.default?.url}
  alt=""
/>

<div>
  <p>{apiData?.snippet?.channelTitle}</p>
  <span>
    {channelData
      ? value_converter(channelData.statistics.subscriberCount)
      : "0"} Subscribers
  </span>
</div>

        <button>Subscribe</button>
      </div>

      <div className="vid-description">
        <p>{apiData?apiData.snippet.description:"Description Here"}</p>

        <hr />

        <h4>{commentData.length} Comments</h4>

{commentData.map((item) => (
  <div className="comment" key={item.id}>
    <img
      src={item.snippet.topLevelComment.snippet.authorProfileImageUrl}
      alt=""
    />

    <div>
      <h3>
        {item.snippet.topLevelComment.snippet.authorDisplayName}
        <span>
          {" "}
          {moment(
            item.snippet.topLevelComment.snippet.publishedAt
          ).fromNow()}
        </span>
      </h3>

      <p
        dangerouslySetInnerHTML={{
          __html: item.snippet.topLevelComment.snippet.textDisplay,
        }}
      />

      <div className="comment-action">
        <img src={like} alt="" />
        <span>
          {value_converter(
            item.snippet.topLevelComment.snippet.likeCount
          )}
        </span>

        <img src={dislike} alt="" />
      </div>
    </div>
  </div>
))}

        
           

         

        

       

         

         

        

       

        

      </div>

    </div>
  );
};

export default PlayVideo;