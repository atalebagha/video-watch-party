import { useState, useEffect } from "react";
import {
  Box,
  Button,
  createTheme,
  CssBaseline,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from 'react-query';
import WatchSession from "./routes/WatchSession";
import CreateSession from "./routes/CreateSession";
import ReplaySession from "./routes/ReplaySession";
import { socket } from './socket';


const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export enum SessionEventEnum {
  'SET_URL',
  'PLAY',
  'PAUSE',
  'SEEK',
  'JOIN',
  'LEAVE',
  'END'
}

export type SessionEvent = {
	type: SessionEventEnum,
	payload: any,
	username: string,
}

const queryClient = new QueryClient()

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1}
      >
		    <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<CreateSession />} />
          <Route path="/create" element={<CreateSession />} />
          <Route path="/watch/:sessionId" element={<WatchSession />} />
          <Route path="/replay/:sessionId" element={<ReplaySession />} />
        </Routes>
		    </QueryClientProvider>
      </Box>
    </ThemeProvider>
  );
};

export default App;
