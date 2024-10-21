import { API_URL, API_USER, API_PASS } from '../../config/api';

USERNAME = API_USER
USERNAME = API_PASS

export async function fetchData() {
  try {
    const url = `${API_URL}/api/metadata`;
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(USERNAME + ":" + PASSWORD));
    
    const response = await fetch(url, { headers });
    
    const text = await response.text();
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${text.substring(0, 200)}...`);
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error(`Failed to parse JSON: ${text.substring(0, 200)}...`);
    }
    
    return data.map(item => ({
      id: item.text_id,
      title_lat: item.title_lat,
      title_ar: item.title_ar,
      file_name: item.file_name,
      author_id: item.author_id,
      author_lat: item.author_lat,
      author_ar: item.author_ar,
      date: item.date ? parseInt(item.date, 10) : null,
      length: item.tok_length ? parseInt(item.tok_length, 10) : null,
      tags: item.tags,
      ed_info: item.ed_info,
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}