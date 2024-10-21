import { loadMetadataFromCSV } from './csvLoader';

export const loadMetadata = async () => {
  try {
    const textsData = await loadMetadataFromCSV();

    const authorMap = new Map();
    textsData.forEach(text => {
      if (!authorMap.has(text.author_ar)) {
        authorMap.set(text.author_ar, {
          value: text.author_id,
          label: text.author_ar,
          author_lat: text.author_lat,
          date: text.date
        });
      }
    });
    const authorOptions = Array.from(authorMap.values());

    // Generate unique genre options
    const genreSet = new Set(textsData.flatMap(text => text.tags));
    const genreOptions = Array.from(genreSet).map(genre => ({ value: genre, label: genre }));

    // Calculate date range
    const dates = textsData
      .map(text => text.date)
      .filter(date => date !== null && !isNaN(date));
    
    const minDate = dates.length > 0 ? Math.min(...dates) : 0;
    const maxDate = dates.length > 0 ? Math.max(...dates) : 2000;

    return {
      texts: textsData,
      authors: authorOptions,
      genreOptions,
      dateRange: {
        min: minDate,
        max: maxDate,
        current: [minDate, maxDate]
      }
    };
  } catch (error) {
    console.error("Error loading metadata:", error);
    throw error;
  }
};