import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BudgetCard from '../components/BudgetCard';
import BudgetForm from '../components/BudgetForm';
import { getBudgets, setBudget, deleteBudget } from '../services/budgetService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Budgets = () => {
  const { user, logout } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [error, setError] = useState('');

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBudgets(month, year);
      setBudgets(data);
      setError('');
    } catch (err) {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleAddClick = () => {
    setEditingBudget(null);
    setShowForm(true);
  };

  const handleEditClick = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleSetBudget = async (budgetData) => {
    await setBudget(budgetData);
    setShowForm(false);
    setEditingBudget(null);
    loadBudgets();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget?')) return;
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

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

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const existingCategories = budgets.map((b) => b.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold text-gray-800">Budgets</h2>
          {!showForm && (
            <button
              onClick={handleAddClick}
              className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Set Budget
            </button>
          )}
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handlePrevMonth}
            className="text-gray-500 hover:text-gray-800 px-2 py-1"
          >
            ←
          </button>
          <span className="font-medium text-gray-700 min-w-[140px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="text-gray-500 hover:text-gray-800 px-2 py-1"
          >
            →
          </button>
        </div>

        {budgets.length > 0 && (
          <p className="text-gray-500 text-sm mb-6">
            Total: <span className="font-semibold text-gray-700">₹{totalSpent.toLocaleString('en-IN')}</span>
            {' '}of <span className="font-semibold text-gray-700">₹{totalLimit.toLocaleString('en-IN')}</span> budgeted
          </p>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              {editingBudget ? `Edit ${editingBudget.category} Budget` : `Set Budget for ${MONTH_NAMES[month - 1]} ${year}`}
            </h3>
            <BudgetForm
              onSubmit={handleSetBudget}
              onCancel={() => {
                setShowForm(false);
                setEditingBudget(null);
              }}
              month={month}
              year={year}
              existingCategories={existingCategories}
              initialData={editingBudget}
            />
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No budgets set for this month yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Budgets;