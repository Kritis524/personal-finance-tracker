import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getSpendingByCategory, getSpendingTrend, getSummary } from '../services/analyticsService';

const COLORS = [
  '#6366f1', '#f97316', '#10b981', '#f59e0b', '#ec4899',
  '#ef4444', '#22c55e', '#8b5cf6', '#64748b',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const Analytics = () => {
  const { user, logout } = useAuth();
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const now = new Date();
        const [categories, trend, summaryData] = await Promise.all([
          getSpendingByCategory(now.getMonth() + 1, now.getFullYear()),
          getSpendingTrend(6),
          getSummary(),
        ]);

        setCategoryData(categories);
        setTrendData(
          trend.map((item) => ({
            label: `${MONTH_NAMES[item.month - 1]} ${item.year}`,
            total: item.total,
          }))
        );
        setSummary(summaryData);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
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

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analytics</h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading analytics...</p>
        ) : (
          <>
            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    ₹{summary.thisMonthTotal.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{summary.thisMonthCount} expenses</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <p className="text-sm text-gray-500">vs Last Month</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      summary.percentChange === null
                        ? 'text-gray-800'
                        : summary.percentChange > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {summary.percentChange === null
                      ? 'N/A'
                      : `${summary.percentChange > 0 ? '+' : ''}${summary.percentChange}%`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ₹{summary.lastMonthTotal.toLocaleString('en-IN')} last month
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <p className="text-sm text-gray-500">Top Category</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.topCategory || '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">This month</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category pie chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Spending by Category (This Month)</h3>
                {categoryData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-12">No expenses this month yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Trend line chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Spending Trend (Last 6 Months)</h3>
                {trendData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-12">Not enough data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;