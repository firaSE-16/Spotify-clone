import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const url = "https://spotify-backend-ay65.onrender.com";

  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [track, setTrack] = useState(null); // Initialize as null
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: {
      second: 0,
      minute: 0,
    },
    totalTime: {
      second: 0,
      minute: 0,
    },
  });

  const play = () => {
    audioRef.current?.play();
    setPlayStatus(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlayStatus(false);
  };

  const playWithId = async (id) => {
    await songsData.map((item)=>{
        if (id === item._id){
            setTrack(item)

        }

    })

    await audioRef.current.play()
    setPlayStatus(true);

  };

  const previous = async () => {
        songsData.map(async (item,index)=>{

            if(track._id === item._id && index>0){
            await   setTrack(songsData[index-1])
            await audioRef.current.play()
            setPlayStatus(true);
            }

        })
  };

  const next = async () => {
    songsData.map(async (item, index) => {
      if (track._id === item._id && index < songsData.length ) {
        await setTrack(songsData[index + 1]);
        await audioRef.current.play();
        setPlayStatus(true);
      }
    });
  };

  const seekSong = (e) => {
    audioRef.current.currentTime =
      (e.nativeEvent.offsetX / seekBg.current.offsetWidth) *
      audioRef.current.duration;
  };

  const getSongData = async () => {
    try {
      const response = await axios.get(`${url}/api/song/list`);
      if (response.data.songs && response.data.songs.length > 0) {
        setSongsData(response.data.songs);
        setTrack(response.data.songs[0]); // Set the first song as the initial track
      }
    } catch (e) {
      console.error("Error fetching songs:", e);
    }
  };

  const getAlbumsData = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`);
      if (response.data.albums) {
        setAlbumsData(response.data.albums);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.ontimeupdate = () => {
        seekBar.current.style.width =
          Math.floor(
            (audioRef.current.currentTime / audioRef.current.duration) * 100
          ) + "%";

        setTime({
          currentTime: {
            second: Math.floor(audioRef.current.currentTime % 60),
            minute: Math.floor(audioRef.current.currentTime / 60),
          },
          totalTime: {
            second: Math.floor(audioRef.current.duration % 60),
            minute: Math.floor(audioRef.current.duration / 60),
          },
        });
      };
    }
  }, [audioRef]);

  useEffect(() => {
    getSongData();
    getAlbumsData();
  }, []);

  const contextValue = {
    audioRef,
    seekBg,
    seekBar,
    track,
    setTrack,
    playStatus,
    setPlayStatus,
    time,
    setTime,
    play,
    pause,
    playWithId,
    previous,
    next,
    seekSong,
    songsData,
    albumsData,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
