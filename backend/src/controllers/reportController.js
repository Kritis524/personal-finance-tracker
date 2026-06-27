import PDFDocument from 'pdfkit';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

const getMonthRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  return { startDate, endDate };
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Shared helper: builds the full report data structure for a given month
const buildReportData = async (userId, month, year) => {
  const { startDate, endDate } = getMonthRange(month, year);

  const expenses = await Expense.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  const budgets = await Budget.find({ user: userId, month, year });

  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);

  return {
    month,
    year,
    monthName: MONTH_NAMES[month - 1],
    totalSpent,
    totalBudgeted,
    expenseCount: expenses.length,
    categoryBreakdown,
    expenses,
  };
};

// @desc    Get full report data for a month (JSON, for frontend display)
// @route   GET /api/reports/:month/:year
// @access  Private
export const getMonthlyReport = async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Valid month (1-12) and year are required' });
    }

    const report = await buildReportData(req.user.id, month, year);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error generating report' });
  }
};

// @desc    Export monthly report as CSV
// @route   GET /api/reports/:month/:year/csv
// @access  Private
export const exportReportCSV = async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    const report = await buildReportData(req.user.id, month, year);

    let csv = 'Date,Title,Category,Amount,Notes\n';
    report.expenses.forEach((exp) => {
      const date = new Date(exp.date).toLocaleDateString('en-IN');
      const title = `"${exp.title.replace(/"/g, '""')}"`;
      const notes = `"${(exp.notes || '').replace(/"/g, '""')}"`;
      csv += `${date},${title},${exp.category},${exp.amount},${notes}\n`;
    });

    csv += `\nTotal,,,${report.totalSpent},\n`;

    const filename = `PocketPal-Report-${report.monthName}-${year}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error exporting CSV' });
  }
};

// @desc    Export monthly report as PDF
// @route   GET /api/reports/:month/:year/pdf
// @access  Private
export const exportReportPDF = async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    const report = await buildReportData(req.user.id, month, year);

    const filename = `PocketPal-Report-${report.monthName}-${year}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('PocketPal', { align: 'left' });
    doc.fontSize(14).fillColor('#555').text(`Monthly Report — ${report.monthName} ${year}`);
    doc.moveDown(1);

    // Summary
    doc.fontSize(12).fillColor('#000');
    doc.text(`Total Spent: Rs. ${report.totalSpent.toLocaleString('en-IN')}`);
    doc.text(`Total Budgeted: Rs. ${report.totalBudgeted.toLocaleString('en-IN')}`);
    doc.text(`Number of Expenses: ${report.expenseCount}`);
    doc.moveDown(1);

    // Category breakdown
    doc.fontSize(14).text('Spending by Category', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    report.categoryBreakdown.forEach((cat) => {
      doc.text(`${cat.category}: Rs. ${cat.total.toLocaleString('en-IN')}`);
    });
    doc.moveDown(1);

    // Expense list
    doc.fontSize(14).text('All Expenses', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);

    report.expenses.forEach((exp) => {
      const date = new Date(exp.date).toLocaleDateString('en-IN');
      doc.text(`${date}  |  ${exp.title}  |  ${exp.category}  |  Rs. ${exp.amount.toLocaleString('en-IN')}`);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error exporting PDF' });
  }
};