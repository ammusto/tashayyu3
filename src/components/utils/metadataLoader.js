import Papa from 'papaparse';

const loadCSV = (url) => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(`CSV parsing completed with ${results.errors.length} errors for ${url}:`, results.errors);
        }
        const validData = results.data.filter(row => Object.values(row).every(value => value !== ""));
        resolve(validData);
      },
      error: (error) => {
        console.error(`Error parsing CSV from ${url}:`, error);
        reject(error);
      }
    });
  });
};

export const loadMetadata = async () => {
  try {
    const [textsData, authorsData] = await Promise.all([
      loadCSV('/texts.csv'),
      loadCSV('/authors.csv')
    ]);

    const processedTexts = textsData.map(text => {
      const author = authorsData.find(author => author.au_id === text.au_id_id);
      return {
        id: text.text_id,
        title_lat: text.title_tl,
        title_ar: text.title_ar,
        file_name: text.pdf,
        author_id: text.au_id_id,
        author_lat: author ? author.au_tl : '',
        author_ar: author ? author.au_ar : '',
        date: author ? parseInt(author.date, 10) : null,
        length: text.word_len ? parseInt(text.word_len, 10) : null,
        tags: [text.genre_id],
        ed_info: text.permbib,
        contrib: text.contrib,
      };
    });

    // Generate author options
    const authorMap = new Map();
    processedTexts.forEach(text => {
      if (!authorMap.has(text.author_ar)) {
        authorMap.set(text.author_ar, {
          author_id: text.author_id,
          author_ar: text.author_ar,
          author_lat: text.author_lat,
          date: text.date
        });
      }
    });
    const authorOptions = Array.from(authorMap.values());

    // Generate unique genre options
    const genreSet = new Set(processedTexts.flatMap(text => text.tags));
    const genreOptions = Array.from(genreSet).map(genre => ({ value: genre, label: genre }));

    // Calculate date range
    const dates = processedTexts
      .map(text => text.date)
      .filter(date => date !== null && !isNaN(date));
    
    const minDate = dates.length > 0 ? Math.min(...dates) : 0;
    const maxDate = dates.length > 0 ? Math.max(...dates) : 2000;

    return {
      texts: processedTexts,
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