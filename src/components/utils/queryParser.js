export function parseAdvancedQuery(query) {
  const tokens = [];
  let currentToken = '';
  let inQuotes = false;

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    if (char === '"') {
      if (inQuotes) {
        tokens.push({ type: 'phrase', value: currentToken.trim() });
        currentToken = '';
      }
      inQuotes = !inQuotes;
    } else if (char === '+' && !inQuotes) {
      if (currentToken) tokens.push({ type: 'phrase', value: currentToken.trim() });
      currentToken = '';
      tokens.push({ type: 'and' });
    } else if (char === '|' && !inQuotes) {
      if (currentToken) tokens.push({ type: 'phrase', value: currentToken.trim() });
      currentToken = '';
      tokens.push({ type: 'or' });
    } else {
      currentToken += char;
    }
  }

  if (currentToken) tokens.push({ type: 'phrase', value: currentToken.trim() });

  return tokens;
}

export function buildSQLQuery(parsedQuery, checkA, checkB) {
  function escapeForFTS5(value) {
    return value.replace(/"/g, '""')
                .replace(/\؟/g, '_')
                .replace(/ئى/g, 'ي')
                .replace(/ؤ/g, 'و')
                .replace(/[أآإ]/g, 'ا')
                .replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&');
  }

  const allProclitics = ['', 'ال', 'و', 'ف', 'ل', 'ب', 'ك', 'وال', 'فال', 'لل', 'بال', 'كال', 'ول', 'فل'];
  const procliticsToRemoveA = ['ال', 'وال', 'فال', 'لل', 'بال', 'كال'];
  const procliticsToRemoveB = ['و', 'ف', 'ل', 'ب', 'ك', 'وال', 'فال', 'لل', 'بال', 'كال', 'ول', 'فل'];

  let proclitics = allProclitics;

  if (!checkA) {
    proclitics = proclitics.filter(p => !procliticsToRemoveA.includes(p));
  }
  if (!checkB) {
    proclitics = proclitics.filter(p => !procliticsToRemoveB.includes(p));
  }

  function processGroup(group) {
    let sql = [];
    let currentOp = 'AND';

    for (let i = 0; i < group.length; i++) {
      const token = group[i];

      if (token.type === 'phrase') {
        const escapedPhrase = escapeForFTS5(token.value);
        const hasWildcard = escapedPhrase.includes('*') || escapedPhrase.includes('_');
        
        const procliticsVariations = proclitics.map(proclitic => {
          if (hasWildcard) {
            return `${proclitic}${escapedPhrase}`;
          } else {
            return `"${proclitic}${escapedPhrase}"`;
          }
        }).join(' OR ');

        sql.push(`${currentOp} (${procliticsVariations})`);
      } else if (token.type === 'and') {
        currentOp = 'AND';
      } else if (token.type === 'or') {
        currentOp = 'OR';
      }
    }

    return sql.join(' ');
  }

  const result = processGroup(parsedQuery);
  return result.startsWith('AND ') ? result.substring(4) : result;
}