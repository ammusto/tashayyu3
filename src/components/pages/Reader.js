import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchPages } from '../services/pageService';
import { useMetadata } from '../context/metadataContext';

const Reader = () => {
  const { textId, vol, pageNum: initialPageNum } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { metadata } = useMetadata();
  const [pages, setPages] = useState({});
  const [currentPageNum, setCurrentPageNum] = useState(parseInt(initialPageNum, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [totalPagesInBook, setTotalPagesInBook] = useState(0);

  const highlightTerm = new URLSearchParams(location.search).get('highlight');

  const bookTitle = metadata?.texts.find(text => text.id === parseInt(textId))?.title_ar || 'Unknown Title';

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { pages: newPages, centerPage, totalPagesInBook } = await fetchPages(textId, vol, initialPageNum);
      setPages(newPages);
      setCurrentPageNum(parseInt(centerPage, 10));
      setTotalPagesInBook(totalPagesInBook);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [textId, vol, initialPageNum]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const pageNumbers = useMemo(() => Object.keys(pages).map(Number).sort((a, b) => a - b), [pages]);

  const handlePageChange = useCallback((newPageNum) => {
    if (pages[newPageNum]) {
      setCurrentPageNum(newPageNum);
    }
  }, [pages]);

  const normalizeQuery = useCallback((query) => {
    return query
      .replace(/ئى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/[أآإ]/g, 'ا');
  }, []);

  const highlightTextInHTML = useCallback((htmlContent, term) => {
    if (!term) return htmlContent;

    const normalizedTerm = normalizeQuery(term);
    const normalizedContent = normalizeQuery(htmlContent);

    const regex = new RegExp(`(${normalizedTerm})`, 'gi');
    let lastIndex = 0;
    let result = '';

    normalizedContent.replace(regex, (match, p1, offset) => {
      result += htmlContent.slice(lastIndex, offset);
      result += `<span class="highlight">${htmlContent.slice(offset, offset + match.length)}</span>`;
      lastIndex = offset + match.length;
    });

    result += htmlContent.slice(lastIndex);
    return result;
  }, [normalizeQuery]);

  const renderPagination = () => {
    const currentIndex = pageNumbers.indexOf(currentPageNum);
    const maxVisibleButtons = 5;
    let startIndex = Math.max(0, currentIndex - Math.floor(maxVisibleButtons / 2));
    let endIndex = Math.min(pageNumbers.length - 1, startIndex + maxVisibleButtons - 1);

    if (endIndex - startIndex < maxVisibleButtons - 1) {
      startIndex = Math.max(0, endIndex - maxVisibleButtons + 1);
    }

    const pageButtons = pageNumbers.slice(startIndex, endIndex + 1).map(pageNum => (
      <button
        key={pageNum}
        onClick={() => handlePageChange(pageNum)}
        disabled={pageNum === currentPageNum}
        className={pageNum === currentPageNum ? 'active' : ''}
      >
        {pageNum}
      </button>
    ));

    return (
      <div className="pagination flex">
        <button
          onClick={() => handlePageChange(pageNumbers[currentIndex - 1])}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        {startIndex > 0 && <span>...</span>}
        {pageButtons}
        {endIndex < pageNumbers.length - 1 && <span>...</span>}
        <button
          onClick={() => handlePageChange(pageNumbers[currentIndex + 1])}
          disabled={currentIndex === pageNumbers.length - 1}
        >
          Next
        </button>
      </div>
    );
  };

  if (isLoading && Object.keys(pages).length === 0) {
    return <div className="reader-loading">Loading...</div>;
  }

  const currentPageContent = pages[currentPageNum]?.text || '';

  return (
    <div className='container'>
      <div className='main'>
        <div className="reader">
          <h1>{bookTitle}</h1>
          <div className="page-content">
            <div
              dangerouslySetInnerHTML={{
                __html: highlightTextInHTML(currentPageContent, highlightTerm),
              }}
            />
            <div className="page-info">
              Volume {vol}, Page {currentPageNum}
            </div>
            {renderPagination()}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Reader;