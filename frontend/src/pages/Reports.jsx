import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMonthlyReport, downloadReportFile } from '../services/reportService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CATEGORY_COLORS = {
  Food: 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Housing: 'bg-purple-100 text-purple-700',
  Utilities: 'bg-yellow-100 text-yellow-700',
  Entertainment: 'bg-pink-100 text-pink-700',
  Health: 'bg-red-100 text-red-700',
  Shopping: 'bg-green-100 text-green-700',
  Education: 'bg-indigo-100 text-indigo-700',
  Other: 'bg-gray-100 text-gray-700',
};

const Reports = () => {
  const { user, logout } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMonthlyReport(month, year);
      setReport(data);
      setError('');
    } catch (err) {
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleDownload = async (format) => {
    setDownloading(format);
    try {
      await downloadReportFile(month, year, format);
    } catch (err) {
      setError(`Failed to download ${format.toUpperCase()}`);
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-gray-800">
            PocketPal
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-red-600 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Monthly Reports</h2>

        {/* Month selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={handlePrevMonth} className="text-gray-500 hover:text-gray-800 px-2 py-1">
              ←
            </button>
            <span className="font-medium text-gray-700 min-w-[140px] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={handleNextMonth} className="text-gray-500 hover:text-gray-800 px-2 py-1">
              →
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading === 'csv' || !report?.expenses?.length}
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              {downloading === 'csv' ? 'Downloading...' : '⬇ CSV'}
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading === 'pdf' || !report?.expenses?.length}
              className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {downloading === 'pdf' ? 'Downloading...' : '⬇ PDF'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading report...</p>
        ) : !report?.expenses?.length ? (
          <div className="text-center py-12 text-gray-400">
            <p>No expenses recorded for {MONTH_NAMES[month - 1]} {year}.</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ₹{report.totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500">Budgeted</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ₹{report.totalBudgeted.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500">Expenses</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{report.expenseCount}</p>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Category Breakdown</h3>
              <div className="space-y-2">
                {report.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other
                      }`}
                    >
                      {cat.category}
                    </span>
                    <span className="font-medium text-gray-700">
                      ₹{cat.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense list */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">All Expenses</h3>
              <div className="space-y-2">
                {report.expenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-gray-800">{exp.title}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(exp.date).toLocaleDateString('en-IN')} · {exp.category}
                      </p>
                    </div>
                    <p className="font-medium text-gray-700">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;