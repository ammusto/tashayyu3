import { API_USER, API_PASS, INDEX } from '../../config/api'

const OPENSEARCH_URL = '/opensearch';


export const performSearch = async (query) => {
  console.log(query)
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${btoa(`${API_USER}:${API_PASS}`)}`
    };

    const response = await fetch(`${OPENSEARCH_URL}/${INDEX}/_search`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenSearch error response:', errorText);
      throw new Error(`OpenSearch error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check if the data contains hits
    if (!data.hits || !data.hits.hits) {
      console.error('Invalid OpenSearch response format:', data);
      return {
        results: [],
        totalResults: 0,
        took: data.took || 0
      };
    }

    return {
      results: data.hits.hits.map(hit => ({
        ...hit._source,
        highlights: hit.highlight || {},
        score: hit._score
      })),
      totalResults: data.hits.total.value || 0,
      took: data.took
    };
  } catch (error) {
    console.error('Search error details:', error);
    throw error;
  }
};
