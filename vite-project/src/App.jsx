import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import axios from 'axios';

function App() {
  const [videoId, setVideoId] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url;
  };

  const handleStream = async () => {
    try {
      setError('');
      const id = extractVideoId(videoId);
      const response = await axios.get(`http://localhost:8000/stream/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setAudioUrl(url);
      setIsPlaying(true);
      setMessage('Streaming started successfully');
    } catch (err) {
      setError('Error streaming video: ' + err.message);
    }
  };

  const handleDownload = async () => {
    try {
      setError('');
      const id = extractVideoId(videoId);
      const response = await axios.get(`http://localhost:8000/download/${id}`);
      setMessage(response.data.message);
    } catch (err) {
      setError('Error downloading video: ' + err.message);
    }
  };

  const handlePlaylistDownload = async () => {
    try {
      setError('');
      const response = await axios.get(`http://localhost:8000/download/playlist`, {
        params: { playlist_url: playlistUrl }
      });
      setMessage(response.data.message);
    } catch (err) {
      setError('Error downloading playlist: ' + err.message);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          YouTube Music Downloader
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Single Video
            </Typography>
            <TextField
              fullWidth
              label="YouTube Video URL or ID"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              margin="normal"
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleStream}>
                Stream
              </Button>
              <Button variant="contained" onClick={handleDownload}>
                Download
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Playlist Download
            </Typography>
            <TextField
              fullWidth
              label="YouTube Playlist URL"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handlePlaylistDownload}>
                Download Playlist
              </Button>
            </Box>
          </CardContent>
        </Card>

        {isPlaying && (
          <Box sx={{ mt: 2 }}>
            <audio controls src={audioUrl} autoPlay>
              Your browser does not support the audio element.
            </audio>
          </Box>
        )}

        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default App; 