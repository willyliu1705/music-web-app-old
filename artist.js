import express from "express";
import cors from "cors"
import fetch from "node-fetch";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve your HTML, CSS, JS

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// Get Spotify token
async function getToken() {
  const authString = `${clientId}:${clientSecret}`;
  const authBase64 = Buffer.from(authString).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + authBase64,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

// Search for artist
async function searchForArtist(token, artistName) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    artistName
  )}&type=artist&limit=1`;

  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });

  const data = await response.json();
  return data.artists.items[0] || null;
}

// Get top tracks
async function getSongsByArtist(token, artistId) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`;

  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });

  const data = await response.json();
  return data.tracks;
}

// API endpoint for frontend
app.post("/search", async (req, res) => {
  try {
    const { artist } = req.body;
    const token = await getToken();

    const artistData = await searchForArtist(token, artist);
    if (!artistData) return res.json({ error: "No artist found" });

    const songs = await getSongsByArtist(token, artistData.id);

    res.json({
      artist: artistData.name,
      songs: songs.map((s) => s.name),
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});