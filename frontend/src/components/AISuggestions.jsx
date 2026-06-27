import { useState, useEffect } from 'react';
import { getSpendingSuggestions } from '../services/aiService';

const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSpendingSuggestions();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError('Could not load suggestions right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm p-6 border border-indigo-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          ✨ AI Spending Insights
        </h3>
        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Refresh'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Analyzing your spending...</p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex gap-2 text-sm text-gray-700">
              <span className="text-indigo-500">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AISuggestions;