import { useEffect, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField, Tooltip } from "@mui/material";
import { useQuery } from 'react-query';
import axios from 'axios';
import LinkIcon from "@mui/icons-material/Link";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

const WatchSession: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState<string | null>(null);

  const [linkCopied, setLinkCopied] = useState(false);

	 const result: any  = useQuery('session', () => {
		 	return axios.get('http://localhost:4001/watch/' + sessionId);
	 })
  useEffect(() => {
				if (result.error) {
					 navigate('/');
				}
			 if (result) {
					 setUrl(result?.data?.data?.url);
				}
    // load video by session ID -- right now we just hardcode a constant video but you should be able to load the video associated with the session

    // if session ID doesn't exist, you'll probably want to redirect back to the home / create session page
  }, [result, navigate]);

  if (!!url) {
    return (
      <>
        <Box
          width="100%"
          maxWidth={1000}
          display="flex"
          gap={1}
          marginTop={1}
          alignItems="center"
        >
          <TextField
            label="Youtube URL"
            variant="outlined"
            value={url}
											 onChange={e => { setUrl(e.target.value)}}
            inputProps={{
              readOnly: false,
              disabled: false,
            }}
            fullWidth
          />
          <Tooltip title={linkCopied ? "Link copied" : "Copy link to share"}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              disabled={linkCopied}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <LinkIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Replay this watch party">
            <Button
              onClick={() => {
                window.open(`/replay/${sessionId}`, "_blank");
              }}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <VideoLibraryIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Create new watch party">
            <Button
              onClick={() => {
                navigate("/create");
              }}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <AddCircleOutlineIcon />
            </Button>
          </Tooltip>
        </Box>
        <VideoPlayer url={url} setUrl={setUrl} />;
      </>
    );
  }

  return null;
};

export default WatchSession;
