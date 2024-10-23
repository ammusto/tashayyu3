import React, { useMemo } from 'react';
import ResultPreview from './ResultPreview';
import Pagination from '../utils/Pagination';
import { useMetadata } from '../context/metadataContext';

const Results = React.memo(({ 
  displayedResults, 
  query, 
  currentPage, 
  totalResults, 
  totalPages,
  itemsPerPage, 
  onPageChange,
  onPageSizeChange
}) => {
  const { metadata, isLoading } = useMetadata();



  const resultsWithMetadata = useMemo(() => {
    if (!metadata || !metadata.texts) {
      return displayedResults;
    }
  
    return displayedResults.map(result => {
      const textMetadata = metadata.texts.find(text => 
        String(text.id) === String(result.text_id)
      ) || { title_ar: 'Unknown Title' };
      
      return { ...result, textMetadata };
    });
  }, [displayedResults, metadata]);

  if (isLoading) {
    return <div className="text-content center"><p>Loading metadata...</p></div>;
  }

  if (!displayedResults || displayedResults.length === 0) {
    return <div className='text-content center'><p>No results found.</p></div>;
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div>
      <div className="results-header">
        <p>
          Showing results {startIndex} - {endIndex} of {totalResults}
        </p>
      </div>
      
      <table className='results-table'>
        <thead>
          <tr>
            <th>Page:Volume</th>
            <th>Preview</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {resultsWithMetadata.map((result, index) => (
            <tr key={index}>
              <td>
                <a
                  href={`/reader/${result.text_id}/${result.vol}/${result.page_num}?highlight=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {result.vol}:{result.page_num}
                </a>
              </td>
              <td>
                <ResultPreview
                  query={query}
                  text={result.text}
                  highlight={result.highlights}
                />
              </td>
              <td>
                <a
                  href={`/text/${result.text_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {result.textMetadata.title_ar}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalItems={totalResults}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
});

export default Results;