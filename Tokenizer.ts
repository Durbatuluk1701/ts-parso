/**
 * Very similar to Tokenize, but we presumed that the
 * token description list "tds" is sorted based on
 * token precedence
 * @param str the string to tokenize
 * @param tds the list of token descriptions
 */
const Tokenize_prime = (str: string, tds: TokenDescription[]): Tokens => {
  if (str.length === 0) {
    // End of input
    return [];
  }
  const goodMatches = tds
    .map((desc) => {
      return {
        name: desc.name,
        match: str.match(desc.description),
      };
    })
    .filter((val) => val.match && val.match.index === 0);
  if (!goodMatches) {
    throw new Error(`We could not tokenize, error with string '${str}'`);
  }
  const optimalMatch = goodMatches[0];
  if (optimalMatch && optimalMatch.match) {
    const best_token: Token = {
      name: optimalMatch.name,
      match: optimalMatch.match[0],
    };
    return [
      best_token,
      ...Tokenize_prime(str.slice(best_token.match.length), tds),
    ];
  }
  throw new Error("Error tokenizing");
};

/**
 * Tokenizes a string "str" using tokens as described
 * in the list of token descriptions "tds"
 * @param str the string to tokenize
 * @param tds the list of token descriptions
 */
export const Tokenize = (str: string, tds: TokenDescription[]): Tokens => {
  const tokens = Tokenize_prime(
    str,
    tds.sort((a, b) => b.precedence - a.precedence)
  );
  return tokens;
};
