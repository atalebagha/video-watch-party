import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from 'react-query';
import axios from 'axios';


const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [newUrl, setNewUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const mutation = useMutation((newSession: any) => {
		return axios.post('http://localhost:4001/create', newSession);
	}, {
		onSuccess(data: any) {
      navigate(`/watch/${data?.data?.id as any}`);
		},
		onSettled() {
			setIsLoading(false);
		}
	})

	const createSession = () => {
    setIsLoading(true);

    const sessionId = uuidv4();
		const value = {
			type: 'CREATE',
		  payload: {
				url: newUrl,
				sessionId,
			}
		}

		mutation.mutate(value);
  };

  return (
    <Box width="100%" maxWidth={600} display="flex" gap={1} marginTop={1}>
      <TextField
        label="Youtube URL"
        variant="outlined"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
        fullWidth
      />
      <Button
        disabled={!newUrl}
        onClick={createSession}
        size="small"
        variant="contained"
      >
        Create a session
      </Button>
    </Box>
  );
};

export default CreateSession;
