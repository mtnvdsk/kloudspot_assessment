const API_BASE = 'https://hiring-dev.internal.kloudspot.com/api';

const getAuthHeaders = () => {
  const storedUser = localStorage.getItem('cms_user');
  const token = storedUser ? JSON.parse(storedUser).token : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const fetchSites = async () => {
  try {
    const response = await fetch(`${API_BASE}/sites`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch sites');
    return await response.json();
  } catch (error) {
    console.error('Sites API error:', error);
    return [];
  }
};
