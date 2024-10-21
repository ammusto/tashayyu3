import Papa from 'papaparse';

const loadCSV = async (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      download: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(`CSV parsing completed with errors for ${file}:`, results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        console.error(`Error parsing CSV (${file}):`, error);
        reject(error);
      }
    });
  });
};

export const loadMetadataFromCSV = async () => {
  try {
    const [textsData, authorsData] = await Promise.all([
      loadCSV('/texts.csv'),
      loadCSV('/authors.csv')
    ]);

    // Process and combine the data
    const processedData = textsData.map(text => {
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
        ed_info: text.contrib,
      };
    });

    return processedData;
  } catch (error) {
    console.error("Error loading metadata from CSV:", error);
    throw error;
  }
};