import express from 'express';
import { getSpendingSuggestions } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/suggestions', getSpendingSuggestions);

export default router;