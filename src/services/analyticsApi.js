const API_BASE = 'https://hiring-dev.internal.kloudspot.com/api';

const getAuthHeaders = () => {
  const storedUser = localStorage.getItem('cms_user');
  const token = storedUser ? JSON.parse(storedUser).token : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const getDayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { fromUtc: start.getTime(), toUtc: end.getTime() };
};

export const getTodayTimeRange = () => getDayRange(new Date());

const fetchAPI = async (endpoint, params) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return await response.json();
};

export const fetchDwellTime = (params) => fetchAPI('/analytics/dwell', params);
export const fetchFootfall = (params) => fetchAPI('/analytics/footfall', params);
export const fetchOccupancy = (params) => fetchAPI('/analytics/occupancy', params);
export const fetchDemographics = (params) => fetchAPI('/analytics/demographics', params);

export const fetchEntryExit = async (params) => {
  const response = await fetch(`${API_BASE}/analytics/entry-exit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      siteId: params.siteId,
      fromUtc: params.fromUtc,
      toUtc: params.toUtc,
      pageSize: params.pageSize || 10,
      pageNumber: params.pageNumber || 1,
    }),
  });
  if (!response.ok) throw new Error('Failed to fetch entry-exit data');
  return await response.json();
};
