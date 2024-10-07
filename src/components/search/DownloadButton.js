import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import WaitingOverlay from '../WaitingOverlay';

const DOWNLOAD_CONTEXT_SIZE = 20;

const DownloadButton = ({ allSearchResults, searchQuery }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('csv');

  const normalizeQuery = (query) => {
    return query
      .replace(/ئى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/[أآإ]/g, 'ا');
  };

  const escapeRegExp = (term) => {
    return term.replace(/[.+^${}()|[\]\\؟]/g, '\\$&');
  };

  const wildcardToRegExp = (term) => {
    const escaped = escapeRegExp(term);
    return escaped
      .replace(/\*/g, '(.*?)')
      .replace(/\\\؟/g, '([^\\s]?)');
  };

  const findAllOccurrences = (searchTerm, text) => {
    const terms = searchTerm.split(' ');
    let regexPattern;
    if (terms.length > 1) {
      const escapedTerms = terms.map(wildcardToRegExp);
      const firstTerm = escapedTerms.shift();
      const restOfPhrase = escapedTerms.join('\\s+');
      regexPattern = `(?:^|\\s|ب|بال|ك|كال|ال|ف|فال|و|وال|ل|لل)(${firstTerm}\\s+${restOfPhrase})(?=$|[\\s,.؛،؟:?])`;
    } else {
      const escapedTerm = wildcardToRegExp(searchTerm);
      regexPattern = `(?:^|\\s|ب|بال|ك|كال|ال|ف|فال|و|وال|ل|لل)(${escapedTerm})(?=$|[\\s,.؛،؟:?])`;
    }
    const regex = new RegExp(regexPattern, 'gi');
    const results = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({ start: match.index, end: regex.lastIndex });
    }
    return results;
  };

  const createDownloadSnippets = (result, query) => {
    const normalizedQuery = normalizeQuery(query);
    const normalizedText = normalizeQuery(result.text);
    const queryParts = normalizedQuery.split(/[|+]/).map(part => part.trim()).filter(Boolean);

    let positions = [];
    queryParts.forEach(part => {
      const partPositions = findAllOccurrences(part, normalizedText);
      positions = positions.concat(partPositions);
    });

    // Sort and merge overlapping positions
    positions.sort((a, b) => a.start - b.start);
    const mergedPositions = positions.reduce((acc, curr) => {
      if (acc.length === 0 || curr.start > acc[acc.length - 1].end) {
        acc.push(curr);
      } else {
        acc[acc.length - 1].end = Math.max(acc[acc.length - 1].end, curr.end);
      }
      return acc;
    }, []);

    // Create snippets
    return mergedPositions.map(position => {
      const start = Math.max(0, position.start - DOWNLOAD_CONTEXT_SIZE);
      const end = Math.min(normalizedText.length, position.end + DOWNLOAD_CONTEXT_SIZE);
      return normalizedText.slice(start, end);
    });
  };

  const generateCSV = (data) => {
    const fields = ['text_id', 'page_num', 'vol', 'title_ar', 'snippets'];
    const csv = [
      fields.join(','),
      ...data.map(row => {
        const snippets = createDownloadSnippets(row, searchQuery).join(' | ');
        return `${row.text_id},${row.page_num},${row.vol},"${row.title_ar}","${snippets}"`;
      })
    ].join('\n');
    return csv;
  };

  const handleDownload = useCallback(() => {
    setIsDownloading(true);
    try {
      let output;
      let contentType;
      let fileName;

      const now = new Date();
      const dateString = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getFullYear().toString().slice(-2)}`;

      if (downloadFormat === 'csv') {
        output = generateCSV(allSearchResults);
        contentType = 'text/csv';
        fileName = `tashayyu3_search_results_${dateString}.csv`;
      } else if (downloadFormat === 'xlsx') {
        const worksheetData = allSearchResults.map(row => ({
          'Text ID': row.text_id,
          'Page Number': row.page_num,
          'Volume': row.vol,
          'Title (Arabic)': row.title_ar,
          'Snippets': createDownloadSnippets(row, searchQuery).join(' | ')
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Search Results');
        output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `tashayyu3_search_results_${dateString}.xlsx`;
      }

      const blob = new Blob([output], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${downloadFormat.toUpperCase()}:`, error);
    } finally {
      setIsDownloading(false);
    }
  }, [allSearchResults, downloadFormat, searchQuery]);

  return (
    <div className="download-container">

      <button
        onClick={handleDownload}
        className="download-button"
        disabled={isDownloading}
      >
        Download Results as {downloadFormat.toUpperCase()}
      </button>
      <select
        value={downloadFormat}
        onChange={(e) => setDownloadFormat(e.target.value)}
        className="download-format-select"
      >
        <option value="csv">CSV</option>
        <option value="xlsx">XLSX</option>
      </select>
      <WaitingOverlay
        isVisible={isDownloading}
        message="Please wait while your file is being prepared. Do not navigate away from this page."
      />
    </div>
  );
};

export default React.memo(DownloadButton);