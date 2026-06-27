import api from './api';

export const getMonthlyReport = async (month, year) => {
  const response = await api.get(`/reports/${month}/${year}`);
  return response.data;
};

export const downloadReportFile = async (month, year, format) => {
  const response = await api.get(`/reports/${month}/${year}/${format}`, {
    responseType: 'blob',
  });

  // Extract filename from Content-Disposition header, or fall back to a default
  const disposition = response.headers['content-disposition'];
  let filename = `PocketPal-Report-${month}-${year}.${format}`;
  if (disposition) {
    const match = disposition.match(/filename="(.+)"/);
    if (match) filename = match[1];
  }

  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};