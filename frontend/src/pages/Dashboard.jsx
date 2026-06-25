import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">PocketPal</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Welcome, {user?.name} 👋
        </h2>
        <p className="text-gray-500 mb-6">
          Here's a quick look at where you can manage your finances.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <Link
            to="/expenses"
            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition border border-gray-100"
          >
            <p className="font-semibold text-gray-800">💸 Expenses</p>
            <p className="text-sm text-gray-500 mt-1">Track your spending</p>
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 opacity-50">
            <p className="font-semibold text-gray-800">📊 Budgets</p>
            <p className="text-sm text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;