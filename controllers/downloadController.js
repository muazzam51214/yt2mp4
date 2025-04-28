import ytDlpWrap from "../config/ytDlp.js";
import axios from "axios"

export const handleFormSubmit = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing video URL.");
  res.redirect(`/convert?url=${url}`);
};

export const getStream = async (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing video URL.");

  try {
    const options = [
      "--dump-json",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "--referer", "https://www.youtube.com/",
      "--extractor-args", "youtube:player-client=web",
      url
    ];
    const execResult = await ytDlpWrap.execPromise(options);
    const videoInfo = JSON.parse(execResult);

    const bestVideoFormat = videoInfo.formats.find(
      (f) => f.ext === "mp4" && f.acodec !== "none" && f.vcodec !== "none"
    );
    const bestAudioFormat = videoInfo.formats.find(
      (f) => f.acodec !== "none" && (f.ext === "m4a" || f.ext === "webm")
    );

    // Format duration from seconds to HH:MM:SS
    const formatDuration = (seconds) => {
      const date = new Date(0);
      date.setSeconds(seconds);
      return date.toISOString().substring(11, 19);
    };

    res.render("result", {
      stream: bestVideoFormat?.url || null,
      audioStream: bestAudioFormat?.url || null,
      title: videoInfo.title || "YouTube Video",
      thumbnail: videoInfo.thumbnail || null,
      duration: videoInfo.duration ? formatDuration(videoInfo.duration) : "00:00",
      currentPage: 'result'
    });
  } catch (error) {
    next(error);
  }
};

export const downloadMp3 = async (req, res, next) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send('Missing video URL.');
  }

  try {
    // Set output filename (using video ID or timestamp)
    const filename = `audio-${Date.now()}.mp3`;
    
    // Set response headers for MP3 download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    // yt-dlp options for direct MP3 conversion
    const options = [
      '-x', // Extract audio
      '--audio-format', 'mp3', // Convert to MP3
      '--audio-quality', '0', // Best quality
      '--add-header', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      '-o', '-', // Output to stdout
      videoUrl
    ];

    // Get the MP3 stream directly from yt-dlp
    const mp3Stream = ytDlpWrap.execStream(options);
    
    // Pipe the MP3 stream directly to the response
    mp3Stream.pipe(res);

    // Handle errors
    mp3Stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).send('Error during audio conversion');
      }
    });

  } catch (error) {
    console.error('Error downloading audio:', error);
    if (!res.headersSent) {
      res.status(500).send('Error downloading audio');
    }
  }
};


export const downloadVideo = async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send("Missing video URL.");
  }

  const filename = `video-${Date.now()}.mp4`;
  // Set headers
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    const options = ["--output", "%(id)s.%(ext)s", videoUrl];

    const execResult = ytDlpWrap.execStream(options);

    execResult.pipe(res);

    execResult.on("end", () => {
      console.log("Video download finished.");
    });

    execResult.on("error", (err) => {
      console.error("Error while streaming video:", err);
      res.status(500).send("Error while downloading");
    });
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).send("Error downloading video");
  }
};

export const homePage = (req, res) => {
  res.render("home", { currentPage: 'home' });
};

export const faqsPage = (req, res) => {
  res.render("faqs", { currentPage: 'faqs' });
};

export const aboutPage = (req, res) => {
  res.render("about", { currentPage: 'about' });
};

export const termPage = (req, res) => {
  res.render("term", { currentPage: 'terms' });
};

export const privacyPage = (req, res) => {
  res.render("privacy", { currentPage: 'privacy' });
};
