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
    const options = ["--dump-json", url];
    const execResult = await ytDlpWrap.execPromise(options);
    const videoInfo = JSON.parse(execResult);

    const bestVideoFormat = videoInfo.formats.find(
      (f) => f.ext === "mp4" && f.acodec !== "none" && f.vcodec !== "none"
    );
    const bestAudioFormat = videoInfo.formats.find(
      (f) => f.acodec !== "none" && (f.ext === "m4a" || f.ext === "webm")
    );

    res.render("result", {
      stream: bestVideoFormat?.url || null,
      audioStream: bestAudioFormat?.url || null,
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
    // Fetch the video info using yt-dlp
    const options = [
      '--dump-json', // Dump JSON metadata of the video
      '--add-header', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      videoUrl
    ];

    const execResult = await ytDlpWrap.execPromise(options);
    const videoInfo = JSON.parse(execResult);

    // Find the best audio format (m4a, webm, etc.)
    const bestAudioFormat = videoInfo.formats.find(format =>
      format.acodec !== 'none' && (format.ext === 'm4a' || format.ext === 'webm' || format.ext === 'opus')
    );

    if (!bestAudioFormat) {
      return res.status(404).send('No suitable audio format found.');
    }

    // Get the audio URL
    const audioUrl = bestAudioFormat.url;

    // Set the response headers to indicate a downloadable file
    const filename = `audio.${bestAudioFormat.ext}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', `audio/${bestAudioFormat.ext}`);

    // Stream the audio directly to the user
    const audioStream = await axios({
      method: 'get',
      url: audioUrl,
      responseType: 'stream'
    });

    audioStream.data.pipe(res);

  } catch (error) {
    console.error('Error downloading audio:', error);
    res.status(500).send('Error downloading audio');
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
  res.render("home");
};
