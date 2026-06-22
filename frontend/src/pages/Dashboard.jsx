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
        <p className="text-gray-500">
          This is your dashboard. Expense tracking, budgets, and analytics are coming in the next few days.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;