import express from 'express';
import { setBudget, getBudgets, deleteBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').post(setBudget).get(getBudgets);
router.route('/:id').delete(deleteBudget);

export default router;