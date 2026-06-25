import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenseService';

const Expenses = () => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [error, setError] = useState('');

  const loadExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAddClick = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingExpense) {
      const updated = await updateExpense(editingExpense._id, formData);
      setExpenses((prev) =>
        prev.map((exp) => (exp._id === updated._id ? updated : exp))
      );
    } else {
      const created = await createExpense(formData);
      setExpenses((prev) => [created, ...prev]);
    }
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Expenses</h2>
            <p className="text-gray-500 text-sm mt-1">
              Total: <span className="font-semibold text-gray-700">₹{totalAmount.toLocaleString('en-IN')}</span>
            </p>
          </div>
          {!showForm && (
            <button
              onClick={handleAddClick}
              className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Add Expense
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              {editingExpense ? 'Edit Expense' : 'New Expense'}
            </h3>
            <ExpenseForm
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingExpense(null);
              }}
              initialData={editingExpense}
            />
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading expenses...</p>
        ) : (
          <ExpenseList expenses={expenses} onEdit={handleEditClick} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
};

export default Expenses;