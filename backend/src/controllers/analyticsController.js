import mongoose from 'mongoose';
import Expense from '../models/Expense.js';

// @desc    Get total spending grouped by category (for a given month/year, or all-time)
// @route   GET /api/analytics/by-category?month=6&year=2026
// @access  Private
export const getSpendingByCategory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const matchStage = { user: userId };

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    const result = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching category analytics' });
  }
};

// @desc    Get monthly spending trend (last N months)
// @route   GET /api/analytics/trend?months=6
// @access  Private
export const getSpendingTrend = async (req, res) => {
  try {
    const monthsBack = parseInt(req.query.months) || 6;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

    const result = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          total: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching spending trend' });
  }
};

// @desc    Get overview summary stats (this month vs last month, top category)
// @route   GET /api/analytics/summary
// @access  Private
export const getSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonthAgg, lastMonthAgg, topCategoryAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const thisMonthTotal = thisMonthAgg[0]?.total || 0;
    const thisMonthCount = thisMonthAgg[0]?.count || 0;
    const lastMonthTotal = lastMonthAgg[0]?.total || 0;
    const topCategory = topCategoryAgg[0]?._id || null;

    const percentChange =
      lastMonthTotal > 0
        ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : null;

    res.status(200).json({
      thisMonthTotal,
      thisMonthCount,
      lastMonthTotal,
      percentChange,
      topCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching summary' });
  }
};