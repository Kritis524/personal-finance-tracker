import { GoogleGenAI } from '@google/genai';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

// @desc    Get AI-powered spending suggestions based on recent expenses and budgets
// @route   GET /api/ai/suggestions
// @access  Private
export const getSpendingSuggestions = async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: thisMonthStart, $lte: thisMonthEnd },
    }).sort({ date: -1 });

    const budgets = await Budget.find({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    if (expenses.length === 0) {
      return res.status(200).json({
        suggestions: [
          'Start logging your expenses this month to get personalized spending insights!',
        ],
      });
    }

    // Summarize data instead of sending every single expense (keeps prompt small and avoids sending unnecessary detail)
    const categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const budgetSummary = budgets.map((b) => {
      const spent = categoryTotals[b.category] || 0;
      return `${b.category}: budgeted ₹${b.limit}, spent ₹${spent} (${Math.round((spent / b.limit) * 100)}%)`;
    });

    const categorySummary = Object.entries(categoryTotals)
      .map(([cat, total]) => `${cat}: ₹${total}`)
      .join(', ');

    const prompt = `You are a friendly personal finance assistant. Based on this user's spending data for the current month, give 3-4 short, specific, actionable suggestions to help them save money or manage their budget better.

Total spent this month: ₹${totalSpent}
Spending by category: ${categorySummary}
${budgetSummary.length > 0 ? `Budget status: ${budgetSummary.join('; ')}` : 'No budgets set yet.'}

Respond with ONLY a JSON array of strings, no markdown, no extra text. Each string should be one suggestion, under 25 words. Example format:
["Suggestion one here", "Suggestion two here", "Suggestion three here"]`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text.trim();

    // Strip markdown code fences if Gemini wraps the JSON in them despite instructions
    const cleanText = text.replace(/^```json\s*|```$/g, '').trim();

    let suggestions;
    try {
      suggestions = JSON.parse(cleanText);
    } catch (parseError) {
      // Fallback: if Gemini didn't return clean JSON, wrap the raw text as a single suggestion
      suggestions = [text];
    }

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ message: 'Failed to generate suggestions. Please try again later.' });
  }
};