import React from 'react';
import ResultPreview from './ResultPreview';
import Pagination from '../utils/Pagination';

const Results = React.memo(({ displayedResults, query, currentPage, totalResults, totalPages, itemsPerPage, onPageChange }) => {
  if (!displayedResults || displayedResults.length === 0) {
    return <div className='text-content center'><p>No results found.</p></div>;
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, 5000);

  const displayTotalResults = totalResults > 5000 ? '5000' : totalResults;
  const actualTotalResults = totalResults > 5000 ? `(total ${totalResults})` : '';

  const maxPages = Math.min(250, totalPages);

  return (
    <div>
      <p>
        {displayTotalResults < 20
          ? `Showing results 1 - ${displayTotalResults}`
          : `Showing results ${startIndex} - ${endIndex} of ${displayTotalResults} ${actualTotalResults}`
        }
      </p>
      <table className='results-table'>
        <thead>
          <tr>
            <th>Page:Volume</th>
            <th>Preview</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {displayedResults.map((result, index) => (
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
                  matchPositions={result.match_positions}
                />
              </td>
              <td><a 
              href={`/text/${result.text_id}`}
              target="_blank"
              rel="noopener noreferrer"

              >{result.title_ar}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalItems={Math.min(5000, totalResults)}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        totalPages={maxPages}
      />
    </div>
  );
});

export default Results;