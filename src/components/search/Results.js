import React, { useMemo } from 'react';
import ResultPreview from './ResultPreview';
import Pagination from '../utils/Pagination';
import { Link } from 'react-router-dom';

const Results = React.memo(({ displayedResults, query, currentPage, totalResults, totalPages, itemsPerPage, onPageChange }) => {
  const resultsToShow = useMemo(() => {
    if (!Array.isArray(displayedResults) || displayedResults.length === 0) {
      return [];
    }
    return displayedResults;
  }, [displayedResults]);

  if (resultsToShow.length === 0) {
    return <div className='text-content center'><p>No results found.</p></div>;
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div>
      <p>Showing results {startIndex} - {endIndex} of {totalResults}</p>
      <table className='results-table'>
        <thead>
          <tr>
            <th>Page:Volume</th>
            <th>Preview</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {resultsToShow.map((result, index) => (
            <tr key={index}>
              <td>
                <Link to={`/reader/${result.text_id}/${result.vol}/${result.page_num}?highlight=${encodeURIComponent(query)}`}>
                  {result.vol}:{result.page_num}
                </Link>
              </td>
              <td>
                <ResultPreview
                  query={query}
                  text={result.text}
                  matchPositions={result.match_positions}
                />
              </td>
              <td>{result.title_ar}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalItems={totalResults}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        totalPages={totalPages}
      />
    </div>
  );
});

export default Results;