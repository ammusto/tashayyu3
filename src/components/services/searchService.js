import API_URL from '../../config/api';

const USERNAME = 'api-nusus';
const PASSWORD = '^6TuN3VTf%j8Af1@';

export const performSearch = async (sqlQuery, texts, page, resultsPerPage) => {
  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(USERNAME + ":" + PASSWORD)
    });

    const response = await fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        sqlQuery,
        texts,
        page,
        resultsPerPage
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
};