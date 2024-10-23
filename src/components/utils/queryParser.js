export function buildOpenSearchQuery(searchConfig, currentPage = 1, itemsPerPage = 20) {
  const { searchType, searchFields, selectedTexts } = searchConfig;

  // Base query structure with pagination
  const query = {
    from: (currentPage - 1) * itemsPerPage,
    size: itemsPerPage,
    track_total_hits: true, // Ensures we get accurate total hits count
    _source: `"text_id", "vol", "page_num", "page_id", "uri"`,
    query: {
      bool: {
        must: [],
        should: [],
        filter: []
      }
    },
    highlight: {
      fields: {
        'page_content': { fragment_size: 250 },
        'token_roots': { fragment_size: 250 }
      },
      require_field_match: false,
      pre_tags: ['<span class="highlight">'],
      post_tags: ['</span>']
    }
  };

  // Add text_id filter if texts are selected
  if (selectedTexts && selectedTexts.length > 0) {
    query.query.bool.filter.push({
      terms: { 'text_id': selectedTexts }
    });
  }

  // Handle different search types
  switch (searchType) {
    case 'simple':
      handleSimpleSearch(query, searchFields[0]);
      break;
    case 'advanced':
      handleAdvancedSearch(query, searchFields);
      break;
    case 'proximity':
      handleProximitySearch(query, searchFields);
      break;
    default:
      throw new Error('Invalid search type');
  }

  return query;
}

function getAnalyzer(definite, proclitic) {
  if (definite && proclitic) return 'combined_analyzer';
  if (definite) return 'definite_analyzer';
  if (proclitic) return 'proclitic_analyzer';
  return 'exact_analyzer';
}

function buildTokenQuery(term, analyzer) {
  if (term.includes('*') || term.includes('?')) {
    return {
      wildcard: {
        'page_content': {
          value: term 
        }
      }
    };
  }

  return {
    match_phrase: {
      'page_content': {
        query: term,
        analyzer: analyzer
      }
    }
  };
}

function buildRootQuery(root) {
  return {
    wildcard: {
      'token_roots': {
        value: `*_${root}`
      }
    }
  };
}

function handleSimpleSearch(query, searchField) {
  const { term, searchIn, definite, proclitic } = searchField;

  if (!term) return;

  if (searchIn === 'tok') {
    const analyzer = getAnalyzer(definite, proclitic);
    query.query.bool.must.push(buildTokenQuery(term, analyzer));
  } else {
    query.query.bool.must.push(buildRootQuery(term));
  }
}

function handleAdvancedSearch(query, searchFields) {
  const andFields = searchFields.filter(field => field.tabType === 'AND');
  const orFields = searchFields.filter(field => field.tabType === 'OR');

  // Check if any field uses root search
  const hasRootSearch = searchFields.some(field => field.searchIn === 'root');

  // Handle AND conditions
  andFields.forEach(field => {
    if (!field.term) return;

    if (hasRootSearch) {
      // If any field is root search, use token_roots for all queries
      const pattern = field.searchIn === 'root' ? `*_${field.term}` : `${field.term}_*`;
      query.query.bool.must.push({
        wildcard: {
          'token_roots': {
            value: pattern
          }
        }
      });
    } else {
      // If no root searches, use regular token search
      const analyzer = getAnalyzer(field.definite, field.proclitic);
      query.query.bool.must.push(buildTokenQuery(field.term, analyzer));
    }
  });

  // Handle OR conditions
  if (orFields.length > 0) {
    const orConditions = {
      bool: {
        should: orFields.map(field => {
          if (!field.term) return null;

          if (hasRootSearch) {
            // If any field is root search, use token_roots for all queries
            const pattern = field.searchIn === 'root' ? `*_${field.term}` : `${field.term}_*`;
            return {
              wildcard: {
                'token_roots': {
                  value: pattern
                }
              }
            };
          } else {
            // If no root searches, use regular token search
            const analyzer = getAnalyzer(field.definite, field.proclitic);
            return buildTokenQuery(field.term, analyzer);
          }
        }).filter(Boolean),
        minimum_should_match: 1
      }
    };

    query.query.bool.must.push(orConditions);
  }
}

function handleProximitySearch(query, searchFields) {
  const { firstTerm, secondTerm, slop } = searchFields;

  // If both are tokens, use match_phrase in page_content
  if (firstTerm.searchIn === 'tok' && secondTerm.searchIn === 'tok') {
    const analyzer = getAnalyzer(firstTerm.definite, firstTerm.proclitic);
    query.query.bool.must.push({
      match_phrase: {
        'page_content': {
          query: `${firstTerm.term} ${secondTerm.term}`,
          analyzer: analyzer,
          slop: slop
        }
      }
    });
    return;
  }

  // If either is a root, use span_near with wildcards
  query.query.bool.must.push({
    span_near: {
      clauses: [
        {
          span_multi: {
            match: {
              wildcard: {
                'token_roots': {
                  value: firstTerm.searchIn === 'root' ? `*_${firstTerm.term}` : `${firstTerm.term}_*`
                }
              }
            }
          }
        },
        {
          span_multi: {
            match: {
              wildcard: {
                'token_roots': {
                  value: secondTerm.searchIn === 'root' ? `*_${secondTerm.term}` : `${secondTerm.term}_*`
                }
              }
            }
          }
        }
      ],
      slop: slop,
      in_order: false
    }
  });
}