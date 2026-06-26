import api from './api';

export const getSpendingByCategory = async (month, year) => {
  const params = {};
  if (month && year) {
    params.month = month;
    params.year = year;
  }
  const response = await api.get('/analytics/by-category', { params });
  return response.data;
};

export const getSpendingTrend = async (months = 6) => {
  const response = await api.get('/analytics/trend', { params: { months } });
  return response.data;
};

export const getSummary = async () => {
  const response = await api.get('/analytics/summary');
  return response.data;
};