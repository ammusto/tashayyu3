import React from 'react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  if (pageCount <= 1) return null;

  const maxVisibleButtons = 3;
  let startPage, endPage;

  if (pageCount <= maxVisibleButtons) {
    startPage = 1;
    endPage = pageCount;
  } else {
    if (currentPage <= Math.floor(maxVisibleButtons / 2) + 1) {
      startPage = 1;
      endPage = maxVisibleButtons;
    } else if (currentPage + Math.floor(maxVisibleButtons / 2) >= pageCount) {
      startPage = pageCount - maxVisibleButtons + 1;
      endPage = pageCount;
    } else {
      startPage = currentPage - Math.floor(maxVisibleButtons / 2);
      endPage = currentPage + Math.floor(maxVisibleButtons / 2);
    }
  }

  const pageButtons = [];
  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        disabled={i === currentPage}
        className={i === currentPage ? 'active' : ''}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="pagination flex">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <span>...</span>}
        </>
      )}
      {pageButtons}
      {endPage < pageCount && (
        <>
          {endPage < pageCount - 1 && <span>...</span>}
          <button onClick={() => onPageChange(pageCount)}>{pageCount}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === pageCount}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;