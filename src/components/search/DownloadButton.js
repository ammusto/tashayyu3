import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import WaitingOverlay from '../WaitingOverlay';

const DownloadButton = ({ allSearchResults, searchQuery }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('csv');

  const generateCSV = (data) => {
    const fields = ['text_id', 'page_num', 'vol', 'title_ar', 'page_content'];
    const csv = [
      fields.join(','),
      ...data.map(row => {
        return `${row.text_id},${row.page_num},${row.vol},"${row.title_ar}","${(row.page_content || '').replace(/"/g, '""')}"`; // Escape quotes in content
      })
    ].join('\n');
    return csv;
  };

  const handleDownload = useCallback(async () => {
    if (!allSearchResults || allSearchResults.length === 0) {
      console.error('No results available for download');
      return;
    }

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
        fileName = `search_results_${dateString}.csv`;
      } else if (downloadFormat === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(allSearchResults.map(hit => ({
          text_id: hit.text_id,
          page_num: hit.page_num,
          vol: hit.vol,
          title_ar: hit.title_ar,
          page_content: hit.page_content || ''
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Results');
        output = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `search_results_${searchQuery ? searchQuery + '_' : ''}${dateString}.xlsx`;
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
  }, [allSearchResults, searchQuery, downloadFormat]);

  return (
    <div className="download-container">
      <button
        onClick={handleDownload}
        className="download-button"
        disabled={isDownloading || !allSearchResults || allSearchResults.length === 0}
      >
        {isDownloading ? 'Preparing Download...' : `Download Results as ${downloadFormat.toUpperCase()}`}
      </button>
      <select
        value={downloadFormat}
        onChange={(e) => setDownloadFormat(e.target.value)}
        className="download-format-select"
        disabled={isDownloading}
      >
        <option value="csv">CSV</option>
        <option value="xlsx">XLSX</option>
      </select>
      <WaitingOverlay
        isVisible={isDownloading}
        message="Please wait while your file is being prepared. This may take a few minutes for large result sets."
      />
    </div>
  );
};

export default React.memo(DownloadButton);