const sanitizeFilename = (url) => {
  return url.split('v=')[1]?.replace(/[^a-zA-Z0-9]/g, '_') || `file_${Date.now()}`;
};

export default sanitizeFilename;
