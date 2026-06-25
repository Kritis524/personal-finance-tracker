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

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No expenses yet. Add your first one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense._id}
          className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3 hover:shadow-sm transition"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-800 truncate">{expense.title}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other
                }`}
              >
                {expense.category}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {formatDate(expense.date)}
              {expense.notes && ` · ${expense.notes}`}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <p className="font-semibold text-gray-800 whitespace-nowrap">
              ₹{expense.amount.toLocaleString('en-IN')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(expense)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(expense._id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;