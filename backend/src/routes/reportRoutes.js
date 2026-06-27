import express from 'express';
import {
  getMonthlyReport,
  exportReportCSV,
  exportReportPDF,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:month/:year', getMonthlyReport);
router.get('/:month/:year/csv', exportReportCSV);
router.get('/:month/:year/pdf', exportReportPDF);

export default router;