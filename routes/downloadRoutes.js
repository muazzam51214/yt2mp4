import { Router } from 'express';
import { getStream, downloadMp3, downloadVideo, homePage, handleFormSubmit } from '../controllers/downloadController.js';

const router = Router();

router.get('/', homePage);
router.get('/convert', getStream);
router.get('/download-mp3', downloadMp3);
router.get('/download', downloadVideo);
router.post('/handle-submit', handleFormSubmit);

export default router;