import ytDlpWrapDefault from 'yt-dlp-wrap';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Proper way to get the constructor in ESM
const YtDlpWrap = ytDlpWrapDefault.default;
const ytDlpWrap = new YtDlpWrap(path.join(__dirname, '../yt-dlp'));

// Verify yt-dlp is working at startup
(async () => {
  try {
    const version = await ytDlpWrap.execPromise(['--version']);
    console.log(`✅ yt-dlp version: ${version.trim()}`);
  } catch (error) {
    console.error('❌ yt-dlp initialization failed:', error);
    process.exit(1);
  }
})();

export default ytDlpWrap;