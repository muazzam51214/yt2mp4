import { Router } from 'express';
import { getStream, downloadMp3, downloadVideo, homePage, handleFormSubmit, faqsPage, aboutPage, termPage, privacyPage } from '../controllers/downloadController.js';

const router = Router();

router.get('/', homePage);
router.get('/faqs', faqsPage);
router.get('/about', aboutPage);
router.get('/terms-of-use', termPage);
router.get('/privacy-policy', privacyPage);
router.get('/convert', getStream);
router.get('/download-mp3', downloadMp3);
router.get('/download', downloadVideo);
router.post('/handle-submit', handleFormSubmit);

export default router;