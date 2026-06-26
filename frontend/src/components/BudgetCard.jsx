const getProgressColor = (percentUsed) => {
  if (percentUsed >= 100) return 'bg-red-500';
  if (percentUsed >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getStatusText = (budget) => {
  if (budget.isOverBudget) {
    return { text: `Over by ₹${Math.abs(budget.remaining).toLocaleString('en-IN')}`, color: 'text-red-600' };
  }
  if (budget.percentUsed >= 80) {
    return { text: `₹${budget.remaining.toLocaleString('en-IN')} left`, color: 'text-yellow-600' };
  }
  return { text: `₹${budget.remaining.toLocaleString('en-IN')} left`, color: 'text-green-600' };
};

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const status = getStatusText(budget);
  const barWidth = Math.min(budget.percentUsed, 100);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">{budget.category}</p>
          <p className="text-sm text-gray-400">
            ₹{budget.spent.toLocaleString('en-IN')} of ₹{budget.limit.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(budget)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(budget._id)}
            className="text-sm text-gray-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all ${getProgressColor(budget.percentUsed)}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
        <span className="text-sm text-gray-400">{budget.percentUsed}%</span>
      </div>

      {budget.isOverBudget && (
        <div className="mt-3 bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2">
          ⚠️ You've exceeded this budget
        </div>
      )}
      {!budget.isOverBudget && budget.percentUsed >= 80 && (
        <div className="mt-3 bg-yellow-50 text-yellow-700 text-xs rounded-lg px-3 py-2">
          ⚡ Approaching your limit
        </div>
      )}
    </div>
  );
};

export default BudgetCard;