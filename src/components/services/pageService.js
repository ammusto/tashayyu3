import API_URL from '../../config/api';

export const fetchPages = async (textId, vol, pageNum) => {
  try {
    const response = await fetch(`${API_URL}/api/pages?textId=${textId}&vol=${vol}&pageNum=${pageNum}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pages');
    }
    
    const data = await response.json();
    
    return {
      pages: data.pages,
      centerPage: data.centerPage,
      totalPagesInBook: data.totalPagesInBook
    };
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};