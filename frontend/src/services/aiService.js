import api from './api';

export const getSpendingSuggestions = async () => {
  const response = await api.get('/ai/suggestions');
  return response.data;
};