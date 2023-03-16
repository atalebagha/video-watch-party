import { Box, Button, Card, IconButton, Stack } from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
// import { useQuery } from 'react-query';
// import axios from 'axios';
import { socket } from '../socket';


interface VideoPlayerProps {
  url: string;
  hideControls?: boolean;
	setUrl?: (url: string) => void;
}

export enum SessionEventEnum {
	  SET_URL = 'SET_URL',
	  PLAY = 'PLAY',
		PAUSE = 'PAUSE',
		SEEK = 'SEEK',
		JOIN = 'JOIN',
		LEAVE = 'LEAVE',
		END = 'END',
		PROGRESS = 'PROGRESS'
}

export type SessionEvent = {
	event: SessionEventEnum,
	payload: any,
	username: string,
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, hideControls, setUrl }) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [isReady, setIsReady] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
  const player = useRef<ReactPlayer>(null);
	const params = useParams();

	const [isConnected, setIsConnected] = useState(socket.connected);
	const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([]);

	const joinSession = () => {
		socket.connect();
		setHasJoined(true);
		socket.emit('session_event', {
			event: 'JOIN',
		  sessionId: params.sessionId,
			payload: {
				sessionId: params.sessionId
			}
		})
	}

	useEffect(() => {
		if (url) {
			socket.emit('session_event', {
				event: 'SET_URL',
				sessionId: params.sessionId,
				payload: {
					sessionId: params.sessionId,
					url,
				}
			})
		}
	}, [url, params])
	useEffect(() => {
		socket.connect();
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

		function onSessionEvent(value: SessionEvent) {
			switch(value.event) {
				case SessionEventEnum.PLAY:
				  setIsPlaying(true);
					break;
				case SessionEventEnum.PAUSE:
					setIsPlaying(false);
					break;
				case SessionEventEnum.SET_URL:
					const url = value.payload.url;
					if (url != null && typeof url === 'string' && setUrl) {
						setUrl(url);
					}
					break;
				case SessionEventEnum.PROGRESS:
					console.log(value.payload);
					console.log(player.current?.getCurrentTime());
					const currentTime = player.current?.getCurrentTime();
					if (currentTime && Math.abs(value.payload.time - currentTime) > 3) {
					  player.current?.seekTo(value.payload.time);
					}
					break;
				default:
					break;
			}
      setSessionEvents(previous => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
		socket.on('session_event', onSessionEvent);

		setIsReady(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
			socket.off('session_event', onSessionEvent);
			socket.disconnect();
    };
  }, []);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleEnd = () => {
    console.log("Video ended");
		socket.emit('session_event', {
			event: 'END',
			sessionId: params.sessionId,
			payload: {
			  sessionId: params.sessionId,
				time: player.current?.getCurrentTime(),
				currentTime: new Date(),
			}
		});
  };

  const handleSeek = (seconds: number) => {
    // Ideally, the seek event would be fired whenever the user moves the built in Youtube video slider to a new timestamp.
    // However, the youtube API no longer supports seek events (https://github.com/cookpete/react-player/issues/356), so this no longer works

    // You'll need to find a different way to detect seeks (or just write your own seek slider and replace the built in Youtube one.)
    // Note that when you move the slider, you still get play, pause, buffer, and progress events, can you use those?

    console.log(
      "This never prints because seek decetion doesn't work: ",
      seconds
    );
  };

  const handlePlay = () => {
		setIsPlaying(true);
		socket.emit('session_event', {
			event: 'PLAY',
			sessionId: params.sessionId,
			payload: {
			  sessionId: params.sessionId,
				time: player.current?.getCurrentTime(),
			}
		})
    console.log(
      "User played video at time: ",
      player.current?.getCurrentTime()
    );
  };

  const handlePause = () => {
		setIsPlaying(false);
		socket.emit('session_event', {
			event: 'PAUSE',
			sessionId: params.sessionId,
			payload: {
			  sessionId: params.sessionId,
				time: player.current?.getCurrentTime(),
			}
		})
    console.log(
      "User paused video at time: ",
      player.current?.getCurrentTime()
    );
  };

  const handleBuffer = () => {
    console.log("Video buffered");
  };

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {

		socket.emit('session_event', {
			event: 'PROGRESS',
			sessionId: params.sessionId,
			payload: {
				...state,
				time: player.current?.getCurrentTime(),
			}
		})
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box
        width="100%"
        height="100%"
        display={hasJoined ? "flex" : "none"}
        flexDirection="column"
      >
      </Box>
			{url && isReady && <ReactPlayer
          ref={player}
          url={url}
          playing={isPlaying}
          controls={!hideControls}
          onReady={handleReady}
          onEnded={handleEnd}
          onSeek={handleSeek}
          onPlay={handlePlay}
          onPause={handlePause}
          onBuffer={handleBuffer}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          style={{ pointerEvents: hideControls ? "none" : "auto" }}
        />}

      {!hasJoined && isReady && (
        // Youtube doesn't allow autoplay unless you've interacted with the page already
        // So we make the user click "Join Session" button and then start playing the video immediately after
        // This is necessary so that when people join a session, they can seek to the same timestamp and start watching the video with everyone else
        <Button
          variant="contained"
          size="large"
          onClick={joinSession}
        >
          Watch Session
        </Button>
      )}
    </Box>
  );
};

export default VideoPlayer;
