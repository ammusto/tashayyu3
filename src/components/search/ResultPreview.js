import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const CONTEXTSIZE = 8;

const ResultPreview = ({ query, vol, textId, pageNum, text, matchPositions }) => {
  const normalizeQuery = (query) => {
    return query
      .replace(/ئى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/[أآإ]/g, 'ا');
  };

  const formatHighlightQuery = (query) => {
    return query.replace(/\s*([|+])\s*/g, '$1');
  };


  const highlightedSnippets = useMemo(() => {
    if (!query || !text) return [];

    const normalizedQuery = normalizeQuery(query);

    const parseQuery = (query) => {
      return query.split(/[|+]/).map(part => part.trim()).filter(Boolean);
    };

    const escapeRegExp = (term) => {
      return term.replace(/[.+^${}()|[\]\\؟]/g, '\\$&');
    };

    const findAllOccurrences = (searchTerm, text) => {
      const terms = searchTerm.split(' ');
      let regexPattern;
      if (terms.length > 1) {
        // Phrase search
        const escapedTerms = terms.map(wildcardToRegExp);
        const firstTerm = escapedTerms.shift();
        const restOfPhrase = escapedTerms.join('\\s+');
        regexPattern = `(?:^|\\s|ب|بال|ك|كال|ال|ف|فال|و|وال|ل|لل)(${firstTerm}\\s+${restOfPhrase})(?=$|[\\s,.؛،؟:?])`;
      } else {
        // Single term search
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

    const wildcardToRegExp = (term) => {
      const escaped = escapeRegExp(term);
      const result = escaped
        .replace(/\*/g, '(.*?)')  // Replace * with zero or more characters of any type (greedy)
        .replace(/\\\؟/g, '([^\\s]?)');  // Keep ? to match zero or one non-whitespace character
      return result;
    };

    const queryParts = parseQuery(normalizedQuery);
    let positions = [];

    queryParts.forEach(part => {
      const partPositions = findAllOccurrences(part, normalizeQuery(text));
      positions = positions.concat(partPositions);
    });

    // Sort positions and merge overlapping ranges
    positions.sort((a, b) => a.start - b.start);
    const mergedPositions = positions.reduce((acc, curr) => {
      if (acc.length === 0 || curr.start > acc[acc.length - 1].end) {
        acc.push(curr);
      } else {
        acc[acc.length - 1].end = Math.max(acc[acc.length - 1].end, curr.end);
      }
      return acc;
    }, []);

    const tokens = text.split(/\s+/);
    const tokenPositions = tokens.reduce((acc, token, index) => {
      acc.push({
        start: acc.length > 0 ? acc[acc.length - 1].end + 1 : 0,
        end: acc.length > 0 ? acc[acc.length - 1].end + 1 + token.length : token.length,
        token
      });
      return acc;
    }, []);

    return mergedPositions.map((position, index) => {
      const startTokenIndex = tokenPositions.findIndex(t => t.end > position.start);
      const endTokenIndex = tokenPositions.findIndex(t => t.start >= position.end);

      const snippetStartIndex = Math.max(0, startTokenIndex - CONTEXTSIZE);
      const snippetEndIndex = Math.min(tokens.length, (endTokenIndex === -1 ? tokens.length : endTokenIndex) + CONTEXTSIZE);

      const beforeContext = tokens.slice(snippetStartIndex, startTokenIndex).join(' ');
      const matchedText = tokens.slice(startTokenIndex, endTokenIndex === -1 ? undefined : endTokenIndex).join(' ');
      const afterContext = tokens.slice(endTokenIndex === -1 ? tokens.length : endTokenIndex, snippetEndIndex).join(' ');

      return (
        <li key={index}>
          {snippetStartIndex > 0}
          {beforeContext}{' '}
          <span className="highlight">{matchedText}</span>{' '}
          {afterContext}
          {snippetEndIndex < tokens.length}
        </li>
      );
    });
  }, [text, query]);

  return (
    <div className='result-preview-container'>
      <ul className='result-preview'>
        {highlightedSnippets}
      </ul>
    </div>
  );
};

export default React.memo(ResultPreview);