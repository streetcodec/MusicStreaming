from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import yt_dlp
import os
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Create Audio folder if it doesn't exist
AUDIO_FOLDER = "Audio"
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)

# Add these lines after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "YouTube Music API"}

@app.get("/stream/{video_id}")
async def stream_music(video_id: str):
    ydl_opts = {
        'format': 'bestaudio',
        'quiet': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            audio_url = info['url'] if 'url' in info else None
            if audio_url is None:
                raise HTTPException(status_code=404, detail="Audio format not found.")
            return StreamingResponse(audio_url, media_type="audio/mpeg")
        except Exception as e:
            raise HTTPException(status_code=404, detail=str(e))

@app.get("/download/{video_id}")
async def download_music(video_id: str):
    output_path = os.path.join(AUDIO_FOLDER, "%(title)s.%(ext)s")
    ydl_opts = {
        'format': 'bestaudio',
        'extract_audio': True,
        'audio_format': 'mp3',
        'outtmpl': output_path,
        'quiet': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
        return {"message": "Download completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/download/playlist")
async def download_playlist(playlist_url: str):
    """
    Downloads audio from a YouTube playlist in MP3 format.
    """
    output_path = os.path.join(AUDIO_FOLDER, "%(playlist_index)s - %(title)s.%(ext)s")
    ydl_opts = {
        'format': 'bestaudio',
        'extract_audio': True,
        'audio_format': 'mp3',
        'outtmpl': output_path,
        'quiet': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([playlist_url])
        return {"message": "Playlist download completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
