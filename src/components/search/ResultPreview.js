import React, { useMemo } from 'react';

// Helper function to process tokens inside and outside of HTML tags
const processHTMLContent = (htmlString) => {
  // This regex will match both text content inside and outside of HTML tags
  return htmlString.replace(/([^<>]+)(?=<|$)/g, (match, textContent) => {
    // Split the text content and process tokens
    const processedText = textContent
      .split(' ')
      .map(token => {
        if (token.includes('_')) {
          return token.split('_')[0]; // Split on underscore and return the first part
        }
        return token; // Leave tokens without underscores unchanged
      })
      .join(' ');

    // Return the processed text
    return processedText;
  });
};

const ResultPreview = ({ query, text, highlight }) => {
  const renderHighlights = useMemo(() => {
    if (!highlight) {
      return <li>No matching preview available.</li>;
    }

    if (highlight.page_content) {
      // Process both text content and <span> tags in 'page_content'
      return highlight.page_content.map((highlightedText, index) => {
        const processedContent = processHTMLContent(highlightedText);
        return <li key={index} dangerouslySetInnerHTML={{ __html: processedContent }} />;
      });
    }

    if (highlight.token_roots) {
      // Process both text content and <span> tags in 'token_roots'
      return highlight.token_roots.map((highlightedText, index) => {
        const processedContent = processHTMLContent(highlightedText);
        return <li key={index} dangerouslySetInnerHTML={{ __html: processedContent }} />;
      });
    }

    // Fallback if no highlights are found
    return <li>No matching preview available.</li>;
  }, [highlight]);

  return (
    <div className='result-preview-container'>
      <ul className='result-preview'>
        {renderHighlights}
      </ul>
    </div>
  );
};

export default React.memo(ResultPreview);
