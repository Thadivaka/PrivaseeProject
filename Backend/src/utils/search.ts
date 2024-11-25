export const createFuzzyMatcher = (searchString: string): RegExp => {
    const escapedStr = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const fuzzyPattern = escapedStr
      .split('')
      .map(char => `${char}.*`)
      .join('');
    return new RegExp(fuzzyPattern, 'i');
  };
  
  export const calculateSearchScore = (text: string, searchTerm: string): number => {
    text = text.toLowerCase();
    searchTerm = searchTerm.toLowerCase();
  
    if (text.includes(searchTerm)) {
      return 1.0;
    }
  
    const textWords = text.split(/\s+/);
    const searchWords = searchTerm.split(/\s+/);
    
    let matchScore = 0;
    for (const searchWord of searchWords) {
      for (const textWord of textWords) {
        if (textWord.includes(searchWord)) {
          matchScore += 0.5;
        } else {
          const fuzzyMatch = createFuzzyMatcher(searchWord);
          if (fuzzyMatch.test(textWord)) {
            matchScore += 0.25;
          }
        }
      }
    }
  
    return Math.min(matchScore / searchWords.length, 1.0);
  };
