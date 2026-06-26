import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

// @desc    Create or update a budget for a category/month/year
// @route   POST /api/budgets
// @access  Private
export const setBudget = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || limit === undefined || !month || !year) {
      return res.status(400).json({ message: 'Category, limit, month, and year are required' });
    }

    // Upsert: update if it exists for this user/category/month/year, else create
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category, month, year },
      { limit },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error setting budget' });
  }
};

// @desc    Get all budgets for a given month/year, with spending progress
// @route   GET /api/budgets?month=6&year=2026
// @access  Private
export const getBudgets = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const budgets = await Budget.find({ user: req.user.id, month, year });

    // Calculate date range for this month to sum actual expenses
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    });

    // Sum spending per category
    const spendingByCategory = {};
    expenses.forEach((exp) => {
      spendingByCategory[exp.category] = (spendingByCategory[exp.category] || 0) + exp.amount;
    });

    const budgetsWithProgress = budgets.map((budget) => {
      const spent = spendingByCategory[budget.category] || 0;
      const percentUsed = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

      return {
        _id: budget._id,
        category: budget.category,
        limit: budget.limit,
        month: budget.month,
        year: budget.year,
        spent,
        remaining: budget.limit - spent,
        percentUsed,
        isOverBudget: spent > budget.limit,
      };
    });

    res.status(200).json(budgetsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching budgets' });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await budget.deleteOne();

    res.status(200).json({ message: 'Budget deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error deleting budget' });
  }
};