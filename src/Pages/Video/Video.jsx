import React, { useState } from 'react'
import './Video.css'
import PlayVideo from '../../Components/PlayVideo/PlayVideo'
import Recommended from '../../Components/Recommended/Recommended'
import { useParams } from 'react-router-dom'

const Video = () => {
  const { videoId } = useParams();
  const [channelId, setChannelId] = useState(null);

  return (
    <div className='play-container'>
      <PlayVideo videoId={videoId} setChannelId={setChannelId} />
      <Recommended channelId={channelId} currentVideoId={videoId} />
    </div>
  )
}

export default Video