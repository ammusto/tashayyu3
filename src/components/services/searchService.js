export const performSearch = async (sqlQuery, texts, page, resultsPerPage) => {
  try {
    const response = await fetch('http://localhost:3001/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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