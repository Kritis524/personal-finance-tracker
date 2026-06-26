import express from 'express';
import {
  getSpendingByCategory,
  getSpendingTrend,
  getSummary,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/by-category', getSpendingByCategory);
router.get('/trend', getSpendingTrend);
router.get('/summary', getSummary);

export default router;